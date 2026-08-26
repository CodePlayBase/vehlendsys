using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;

namespace VehicleLendingSystem.Desktop.Services
{
    public enum VehicleType
    {
        [JsonPropertyName("car")]
        Car,
        [JsonPropertyName("bike")]
        Bike,
        [JsonPropertyName("bicycle")]
        Bicycle
    }

    public enum VehicleStatus
    {
        [JsonPropertyName("available")]
        Available,
        [JsonPropertyName("rented")]
        Rented,
        [JsonPropertyName("maintenance")]
        Maintenance,
        [JsonPropertyName("reserved")]
        Reserved
    }

    public class VehicleDto
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = string.Empty;

        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;

        [JsonPropertyName("brand")]
        public string Brand { get; set; } = string.Empty;

        [JsonPropertyName("model")]
        public string Model { get; set; } = string.Empty;

        [JsonPropertyName("type")]
        public string Type { get; set; } = string.Empty;

        [JsonPropertyName("licensePlate")]
        public string? LicensePlate { get; set; }

        [JsonPropertyName("serialNumber")]
        public string SerialNumber { get; set; } = string.Empty;

        [JsonPropertyName("status")]
        public string Status { get; set; } = string.Empty;

        [JsonPropertyName("hourlyRate")]
        public decimal HourlyRate { get; set; }

        [JsonPropertyName("dailyRate")]
        public decimal DailyRate { get; set; }

        [JsonPropertyName("fuelOrBatteryLevel")]
        public int FuelOrBatteryLevel { get; set; }

        [JsonPropertyName("locationHub")]
        public string LocationHub { get; set; } = string.Empty;

        [JsonPropertyName("imageUrl")]
        public string ImageUrl { get; set; } = string.Empty;

        [JsonPropertyName("conditionNotes")]
        public string? ConditionNotes { get; set; }

        [JsonPropertyName("lastMaintainedDate")]
        public string? LastMaintainedDate { get; set; }
    }

    public class UpdateVehicleStatusRequest
    {
        [JsonPropertyName("status")]
        public string Status { get; set; } = string.Empty;

        [JsonPropertyName("fuelOrBatteryLevel")]
        public int? FuelOrBatteryLevel { get; set; }

        [JsonPropertyName("conditionNotes")]
        public string? ConditionNotes { get; set; }
    }

    /// <summary>
    /// Thread-safe Asynchronous HTTP API Service for C# Windows Forms Worker Station.
    /// Interacts with Mock REST API / MockAPI.io endpoints.
    /// </summary>
    public class VehicleApiService : IDisposable
    {
        private readonly HttpClient _httpClient;
        private readonly JsonSerializerOptions _jsonOptions;
        private bool _disposed = false;

        public string BaseUrl { get; private set; }

        public VehicleApiService(string baseUrl = "https://api.vehiclelending.local/v1")
        {
            BaseUrl = baseUrl.TrimEnd('/');

            var handler = new SocketsHttpHandler
            {
                PooledConnectionLifetime = TimeSpan.FromMinutes(15),
                MaxConnectionsPerServer = 10
            };

            _httpClient = new HttpClient(handler)
            {
                BaseAddress = new Uri(BaseUrl + "/"),
                Timeout = TimeSpan.FromSeconds(15)
            };

            _httpClient.DefaultRequestHeaders.Accept.Clear();
            _httpClient.DefaultRequestHeaders.Accept.Add(
                new MediaTypeWithQualityHeaderValue("application/json")
            );
            _httpClient.DefaultRequestHeaders.Add("User-Agent", "VehicleLending-DesktopWorker/1.0");

            _jsonOptions = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
                DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
            };
        }

        public void SetBaseUrl(string newBaseUrl)
        {
            BaseUrl = newBaseUrl.TrimEnd('/');
            _httpClient.BaseAddress = new Uri(BaseUrl + "/");
        }

        /// <summary>
        /// Asynchronously fetches all vehicles for physical inventory inspection.
        /// </summary>
        public async Task<List<VehicleDto>> GetVehicleInventoryAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                using var response = await _httpClient.GetAsync("vehicles", HttpCompletionOption.ResponseHeadersRead, cancellationToken)
                    .ConfigureAwait(false);

                response.EnsureSuccessStatusCode();

                await using var contentStream = await response.Content.ReadAsStreamAsync(cancellationToken)
                    .ConfigureAwait(false);

                var vehicles = await JsonSerializer.DeserializeAsync<List<VehicleDto>>(contentStream, _jsonOptions, cancellationToken)
                    .ConfigureAwait(false);

                return vehicles ?? new List<VehicleDto>();
            }
            catch (HttpRequestException ex)
            {
                // Log and wrap HTTP protocol errors
                throw new ApplicationException($"Network error while fetching vehicle inventory: {ex.Message}", ex);
            }
            catch (JsonException ex)
            {
                throw new ApplicationException($"Failed to deserialize vehicle JSON response: {ex.Message}", ex);
            }
            catch (OperationCanceledException)
            {
                // Request was cancelled by the UI caller
                throw;
            }
        }

        /// <summary>
        /// Asynchronously searches vehicle by License Plate or Barcode / Serial Number.
        /// </summary>
        public async Task<VehicleDto?> FindVehicleByBarcodeOrPlateAsync(string query, CancellationToken cancellationToken = default)
        {
            var vehicles = await GetVehicleInventoryAsync(cancellationToken);
            var normalized = query.Trim().ToUpperInvariant();
            
            return vehicles.Find(v => 
                v.SerialNumber.ToUpperInvariant().Contains(normalized) || 
                (v.LicensePlate != null && v.LicensePlate.ToUpperInvariant().Contains(normalized))
            );
        }

        /// <summary>
        /// Updates real-time availability and maintenance check status from worker physical inspection.
        /// </summary>
        public async Task<bool> UpdatePhysicalStatusAsync(
            string vehicleId, 
            string status, 
            int fuelLevel, 
            string notes, 
            CancellationToken cancellationToken = default)
        {
            var updatePayload = new UpdateVehicleStatusRequest
            {
                Status = status.ToLowerInvariant(),
                FuelOrBatteryLevel = fuelLevel,
                ConditionNotes = notes
            };

            var jsonContent = new StringContent(
                JsonSerializer.Serialize(updatePayload, _jsonOptions),
                Encoding.UTF8,
                "application/json"
            );

            try
            {
                using var response = await _httpClient.PatchAsync($"vehicles/{vehicleId}", jsonContent, cancellationToken)
                    .ConfigureAwait(false);

                return response.IsSuccessStatusCode;
            }
            catch (Exception ex)
            {
                throw new ApplicationException($"Failed to update vehicle status for ID {vehicleId}: {ex.Message}", ex);
            }
        }

        public void Dispose()
        {
            if (!_disposed)
            {
                _httpClient.Dispose();
                _disposed = true;
            }
            GC.SuppressFinalize(this);
        }
    }
}
