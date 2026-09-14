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
    // ============================================================
    // DTO — mirror field server + computed normalized properties
    // ============================================================
    public class VehicleDto
    {
        // --- Core fields (server pasti kirim) ---
        [JsonPropertyName("id")]
        public string Id { get; set; } = string.Empty;

        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;

        [JsonPropertyName("brand")]
        public string Brand { get; set; } = string.Empty;

        [JsonPropertyName("status")]
        public string Status { get; set; } = "available";

        // --- Optional / beda-beda nama ---
        [JsonPropertyName("model")]
        public string? Model { get; set; }

        [JsonPropertyName("type")]
        public string Type { get; set; } = string.Empty;

        [JsonPropertyName("dailyRate")]
        public decimal DailyRate { get; set; }

        [JsonPropertyName("hourlyRate")]
        public decimal? HourlyRateRaw { get; set; }

        // Server kirim "plateNumber", mobile expect "licensePlate"
        [JsonPropertyName("plateNumber")]
        public string? PlateNumber { get; set; }

        [JsonPropertyName("licensePlate")]
        public string? LicensePlateRaw { get; set; }

        // Server kirim "location", mobile expect "locationHub"
        [JsonPropertyName("location")]
        public string? Location { get; set; }

        [JsonPropertyName("locationHub")]
        public string? LocationHubRaw { get; set; }

        // Server kirim "capacity", mobile expect "seats"
        [JsonPropertyName("capacity")]
        public int? Capacity { get; set; }

        [JsonPropertyName("seats")]
        public int? SeatsRaw { get; set; }

        // Level bahan bakar
        [JsonPropertyName("fuelOrBatteryLevel")]
        public int? FuelOrBatteryLevelRaw { get; set; }

        [JsonPropertyName("fuelLevel")]
        public int? FuelLevel { get; set; }

        [JsonPropertyName("batteryLevel")]
        public int? BatteryLevel { get; set; }

        [JsonPropertyName("serialNumber")]
        public string? SerialNumberRaw { get; set; }

        [JsonPropertyName("description")]
        public string? Description { get; set; }

        [JsonPropertyName("conditionNotes")]
        public string? ConditionNotesRaw { get; set; }

        [JsonPropertyName("imageUrl")]
        public string? ImageUrl { get; set; }

        [JsonPropertyName("year")]
        public int Year { get; set; }

        [JsonPropertyName("lastMaintainedDate")]
        public string? LastMaintainedDate { get; set; }

        // ============================================================
        // NORMALIZED COMPUTED PROPERTIES
        // Ini yang dipakai UI (DataGridView, form, dll)
        // ============================================================

        [JsonIgnore]
        public decimal HourlyRate => HourlyRateRaw ?? (DailyRate > 0 ? DailyRate / 8m : 0);

        [JsonIgnore]
        public string? LicensePlate => LicensePlateRaw ?? PlateNumber;

        [JsonIgnore]
        public string LocationHub => LocationHubRaw ?? Location ?? "-";

        [JsonIgnore]
        public int Seats => SeatsRaw ?? Capacity ?? 0;

        [JsonIgnore]
        public int FuelOrBatteryLevel =>
            FuelOrBatteryLevelRaw ?? FuelLevel ?? BatteryLevel ?? 100;

        [JsonIgnore]
        public string SerialNumber => SerialNumberRaw ?? Id;

        [JsonIgnore]
        public string? ConditionNotes => ConditionNotesRaw ?? Description;

        // ============================================================
        // POST-DESERIALIZE NORMALIZATION (dipanggil service setelah parse)
        // ============================================================
        public void Normalize()
        {
            Type = (Type ?? string.Empty).ToLowerInvariant() switch
            {
                "mobil" or "car" => "car",
                "motor" or "bike" => "bike",
                "sepeda" or "bicycle" => "bicycle",
                _ => "car"
            };

            Status = (Status ?? string.Empty).ToLowerInvariant() switch
            {
                "tersedia" or "available" => "available",
                "disewa" or "rented" => "rented",
                "perbaikan" or "maintenance" => "maintenance",
                "dipesan" or "reserved" => "reserved",
                _ => "available"
            };
        }
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

    // ============================================================
    // API SERVICE
    // ============================================================
    public class VehicleApiService : IDisposable
    {
        private readonly HttpClient _httpClient;
        private readonly JsonSerializerOptions _jsonOptions;
        private bool _disposed;

        public string BaseUrl { get; private set; }

        /// <summary>
        /// Default ke Node.js API lokal (server/server.js di port 4000).
        /// Ganti lewat constructor atau SetBaseUrl kalau backend sudah production.
        /// </summary>
        public VehicleApiService(string baseUrl = "http://127.0.0.1:4000/api")
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
                new MediaTypeWithQualityHeaderValue("application/json"));
            _httpClient.DefaultRequestHeaders.Add("User-Agent", "VehicleLending-DesktopWorker/1.0");

            _jsonOptions = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
                DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
                NumberHandling = JsonNumberHandling.AllowReadingFromString
            };
        }

        public void SetBaseUrl(string newBaseUrl)
        {
            BaseUrl = newBaseUrl.TrimEnd('/');
            _httpClient.BaseAddress = new Uri(BaseUrl + "/");
        }

        // ============================================================
        // GET /vehicles
        // ============================================================
        public async Task<List<VehicleDto>> GetVehicleInventoryAsync(
            CancellationToken cancellationToken = default)
        {
            try
            {
                using var response = await _httpClient
                    .GetAsync("vehicles", HttpCompletionOption.ResponseHeadersRead, cancellationToken)
                    .ConfigureAwait(false);

                response.EnsureSuccessStatusCode();

                await using var stream = await response.Content
                    .ReadAsStreamAsync(cancellationToken)
                    .ConfigureAwait(false);

                var vehicles = await JsonSerializer
                    .DeserializeAsync<List<VehicleDto>>(stream, _jsonOptions, cancellationToken)
                    .ConfigureAwait(false);

                var list = vehicles ?? new List<VehicleDto>();

                // ✅ NORMALIZE — mapping schema server ke schema internal
                foreach (var v in list) v.Normalize();

                return list;
            }
            catch (HttpRequestException ex)
            {
                throw new ApplicationException(
                    $"Network error while fetching vehicle inventory: {ex.Message}", ex);
            }
            catch (JsonException ex)
            {
                throw new ApplicationException(
                    $"Failed to deserialize vehicle JSON response: {ex.Message}", ex);
            }
            catch (OperationCanceledException)
            {
                throw;
            }
        }

        // ============================================================
        // SEARCH by Plate or Barcode
        // ============================================================
        public async Task<VehicleDto?> FindVehicleByBarcodeOrPlateAsync(
            string query, CancellationToken cancellationToken = default)
        {
            var vehicles = await GetVehicleInventoryAsync(cancellationToken);
            var q = (query ?? string.Empty).Trim().ToUpperInvariant();

            return vehicles.Find(v =>
                (v.SerialNumber ?? string.Empty).ToUpperInvariant().Contains(q) ||
                (v.LicensePlate ?? string.Empty).ToUpperInvariant().Contains(q)
            );
        }

        // ============================================================
        // PATCH /vehicles/:id — update physical status
        // ============================================================
        public async Task<bool> UpdatePhysicalStatusAsync(
            string vehicleId,
            string status,
            int fuelLevel,
            string notes,
            CancellationToken cancellationToken = default)
        {
            var payload = new UpdateVehicleStatusRequest
            {
                Status = status.ToLowerInvariant(),
                FuelOrBatteryLevel = fuelLevel,
                ConditionNotes = notes
            };

            var json = JsonSerializer.Serialize(payload, _jsonOptions);
            using var content = new StringContent(json, Encoding.UTF8, "application/json");

            try
            {
                using var response = await _httpClient
                    .PatchAsync($"vehicles/{vehicleId}", content, cancellationToken)
                    .ConfigureAwait(false);

                if (!response.IsSuccessStatusCode)
                {
                    var body = await response.Content.ReadAsStringAsync(cancellationToken);
                    throw new ApplicationException(
                        $"Server returned {(int)response.StatusCode}: {body}");
                }

                return true;
            }
            catch (HttpRequestException ex)
            {
                throw new ApplicationException(
                    $"Failed to reach server for update: {ex.Message}", ex);
            }
        }

        // ============================================================
        // Utility: test koneksi ke server
        // ============================================================
        public async Task<bool> TestConnectionAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                using var response = await _httpClient
                    .GetAsync("vehicles", cancellationToken)
                    .ConfigureAwait(false);
                return response.IsSuccessStatusCode;
            }
            catch
            {
                return false;
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