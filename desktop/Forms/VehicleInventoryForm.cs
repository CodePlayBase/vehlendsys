using System;
using System.Drawing;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Forms;
using VehicleLendingSystem.Desktop.Services;

namespace VehicleLendingSystem.Desktop.Forms
{
    public partial class VehicleInventoryForm : Form
    {
        private readonly VehicleApiService _apiService;
        private CancellationTokenSource? _cts;
        private DataGridView? _dgvInventory;
        private TextBox? _txtBarcodeScanner;
        private ComboBox? _cmbStatusUpdate;
        private NumericUpDown? _numFuelLevel;
        private TextBox? _txtConditionNotes;
        private Button? _btnSync;
        private Button? _btnApplyUpdate;
        private Label? _lblStatusMessage;
        private string? _selectedVehicleId;

        public VehicleInventoryForm()
        {
            _apiService = new VehicleApiService();
            InitializeComponent();
            Load += async (s, e) => await RefreshInventoryAsync();
        }

        private void InitializeComponent()
        {
            Text = "Vehicle Lending System - Physical Inventory & Worker Terminal";
            Size = new Size(1100, 680);
            StartPosition = FormStartPosition.CenterScreen;
            Font = new Font("Segoe UI", 9.5f, FontStyle.Regular);
            BackColor = Color.FromArgb(240, 242, 245);

            // 1. Top Bar / Search Bar
            var pnlTop = new Panel
            {
                Dock = DockStyle.Top,
                Height = 60,
                BackColor = Color.White,
                Padding = new Padding(15, 12, 15, 12)
            };

            var lblBarcode = new Label
            {
                Text = "Barcode / Plate Scan:",
                AutoSize = true,
                Location = new Point(15, 18),
                Font = new Font("Segoe UI", 9.5f, FontStyle.Bold)
            };

            _txtBarcodeScanner = new TextBox
            {
                Location = new Point(160, 15),
                Width = 240,
                PlaceholderText = "Scan Serial / Enter Plate..."
            };
            _txtBarcodeScanner.KeyDown += async (s, e) =>
            {
                if (e.KeyCode == Keys.Enter)
                {
                    await PerformBarcodeLookupAsync(_txtBarcodeScanner.Text);
                }
            };

            _btnSync = new Button
            {
                Text = "🔄 Refresh Cloud Inventory",
                Location = new Point(420, 13),
                Width = 180,
                Height = 32,
                BackColor = Color.FromArgb(37, 99, 235),
                ForeColor = Color.White,
                FlatStyle = FlatStyle.Flat
            };
            _btnSync.Click += async (s, e) => await RefreshInventoryAsync();

            pnlTop.Controls.Add(lblBarcode);
            pnlTop.Controls.Add(_txtBarcodeScanner);
            pnlTop.Controls.Add(_btnSync);

            // 2. DataGridView for Inventory
            _dgvInventory = new DataGridView
            {
                Dock = DockStyle.Fill,
                BackgroundColor = Color.White,
                BorderStyle = BorderStyle.None,
                SelectionMode = DataGridViewSelectionMode.FullRowSelect,
                MultiSelect = false,
                ReadOnly = true,
                AutoGenerateColumns = false,        // ← MATIKAN
                AllowUserToAddRows = false,          // ← hilangkan baris kosong di bawah
                AllowUserToResizeRows = false,
                RowHeadersVisible = false,
                ColumnHeadersHeight = 36,            // ← header lebih tinggi
                ColumnHeadersHeightSizeMode = DataGridViewColumnHeadersHeightSizeMode.DisableResizing,
                EnableHeadersVisualStyles = false,
                ColumnHeadersDefaultCellStyle = new DataGridViewCellStyle
                {
                    BackColor = Color.FromArgb(241, 245, 249),
                    ForeColor = Color.FromArgb(51, 65, 85),
                    Font = new Font("Segoe UI", 9.5f, FontStyle.Bold),
                    Alignment = DataGridViewContentAlignment.MiddleLeft,
                    Padding = new Padding(6, 0, 6, 0),
                    SelectionBackColor = Color.FromArgb(241, 245, 249),
                    SelectionForeColor = Color.FromArgb(51, 65, 85)
                },
                DefaultCellStyle = new DataGridViewCellStyle
                {
                    Font = new Font("Segoe UI", 9f),
                    Padding = new Padding(6, 4, 6, 4),
                    SelectionBackColor = Color.FromArgb(219, 234, 254),
                    SelectionForeColor = Color.FromArgb(30, 41, 59)
                },
                RowTemplate = { Height = 32 },
                AlternatingRowsDefaultCellStyle = new DataGridViewCellStyle
                {
                    BackColor = Color.FromArgb(248, 250, 252)
                }
            };

            // ============================================================
            // DEFINE COLUMNS MANUAL — hanya yang mau ditampilkan
            // ============================================================
            void AddCol(string prop, string header, int width, string? format = null)
            {
                var col = new DataGridViewTextBoxColumn
                {
                    Name = prop,                       // ← INI YANG KURANG
                    DataPropertyName = prop,
                    HeaderText = header,
                    Width = width,
                    SortMode = DataGridViewColumnSortMode.Automatic
                };
                if (format != null) col.DefaultCellStyle.Format = format;
                _dgvInventory.Columns.Add(col);
            }

            AddCol(nameof(VehicleDto.Id), "ID", 80);
            AddCol(nameof(VehicleDto.Name), "Nama Kendaraan", 180);
            AddCol(nameof(VehicleDto.Brand), "Merek", 90);
            AddCol(nameof(VehicleDto.Type), "Tipe", 70);
            AddCol(nameof(VehicleDto.LicensePlate), "Plat Nomor", 100);
            AddCol(nameof(VehicleDto.Status), "Status", 90);
            AddCol(nameof(VehicleDto.DailyRate), "Tarif/Hari", 90, "N0");
            AddCol(nameof(VehicleDto.HourlyRate), "Tarif/Jam", 85, "N0");
            AddCol(nameof(VehicleDto.FuelOrBatteryLevel), "BBM/Baterai", 80, "0'%'");
            AddCol(nameof(VehicleDto.LocationHub), "Lokasi Hub", 180);
            AddCol(nameof(VehicleDto.Seats), "Seats", 55);
            AddCol(nameof(VehicleDto.Year), "Tahun", 60);
            AddCol(nameof(VehicleDto.SerialNumber), "Serial", 120);
            AddCol(nameof(VehicleDto.LastMaintainedDate), "Servis Terakhir", 110);

            // Isi sisa lebar dengan kolom Lokasi Hub yang bisa stretch
            _dgvInventory.Columns[nameof(VehicleDto.LocationHub)].AutoSizeMode =
                DataGridViewAutoSizeColumnMode.Fill;

            _dgvInventory.SelectionChanged += DgvInventory_SelectionChanged;
            _dgvInventory.AutoGenerateColumns = true;   // sudah default true, tapi eksplisit lebih aman
            _dgvInventory.DataBindingComplete += (s, e) =>
            {
                if (_dgvInventory.Columns.Count == 0) return;

                // Set header lebih manusiawi
                var headers = new Dictionary<string, string>
                {
                    ["Id"] = "ID",
                    ["Name"] = "Nama Kendaraan",
                    ["Brand"] = "Merek",
                    ["Model"] = "Model",
                    ["Type"] = "Tipe",
                    ["LicensePlate"] = "Plat Nomor",
                    ["SerialNumber"] = "Serial",
                    ["Status"] = "Status",
                    ["HourlyRate"] = "Tarif/Jam",
                    ["DailyRate"] = "Tarif/Hari",
                    ["FuelOrBatteryLevel"] = "BBM/Baterai (%)",
                    ["LocationHub"] = "Lokasi Hub",
                    ["Year"] = "Tahun",
                    ["LastMaintainedDate"] = "Servis Terakhir"
                };

                foreach (DataGridViewRow row in _dgvInventory.Rows)
                {
                    if (row.DataBoundItem is VehicleDto v)
                    {
                        var statusCell = row.Cells[nameof(VehicleDto.Status)];
                        statusCell.Value = char.ToUpper(v.Status[0]) + v.Status.Substring(1);

                        // Warna status cell
                        statusCell.Style.ForeColor = v.Status switch
                        {
                            "available" => Color.FromArgb(21, 128, 61),   // hijau
                            "rented" => Color.FromArgb(180, 83, 9),    // oranye
                            "maintenance" => Color.FromArgb(185, 28, 28),   // merah
                            "reserved" => Color.FromArgb(29, 78, 216),   // biru
                            _ => Color.FromArgb(55, 65, 81)
                        };
                        statusCell.Style.Font = new Font("Segoe UI", 9f, FontStyle.Bold);
                    }
                }

                // Sembunyikan kolom yang tidak perlu ditampilkan
                var hideColumns = new[] { "ImageUrl", "ConditionNotes", "Description" };

                foreach (DataGridViewColumn col in _dgvInventory.Columns)
                {
                    if (headers.TryGetValue(col.Name, out var title))
                        col.HeaderText = title;

                    if (hideColumns.Contains(col.Name))
                        col.Visible = false;
                }
            };

            // 3. Right Inspection Panel
            var pnlRight = new Panel
            {
                Dock = DockStyle.Right,
                Width = 320,
                BackColor = Color.White,
                Padding = new Padding(20)
            };

            var lblInspectionTitle = new Label
            {
                Text = "Physical Inspection & Update",
                Font = new Font("Segoe UI", 11f, FontStyle.Bold),
                Location = new Point(20, 20),
                AutoSize = true
            };

            var lblStatus = new Label { Text = "Vehicle Status:", Location = new Point(20, 65), AutoSize = true };
            _cmbStatusUpdate = new ComboBox
            {
                Location = new Point(20, 85),
                Width = 270,
                DropDownStyle = ComboBoxStyle.DropDownList
            };
            _cmbStatusUpdate.Items.AddRange(new object[] { "available", "rented", "maintenance", "reserved" });

            var lblFuel = new Label { Text = "Fuel / Battery (%):", Location = new Point(20, 125), AutoSize = true };
            _numFuelLevel = new NumericUpDown
            {
                Location = new Point(20, 145),
                Width = 270,
                Minimum = 0,
                Maximum = 100,
                Value = 100
            };

            var lblNotes = new Label { Text = "Condition Notes:", Location = new Point(20, 185), AutoSize = true };
            _txtConditionNotes = new TextBox
            {
                Location = new Point(20, 205),
                Width = 270,
                Height = 80,
                Multiline = true
            };

            _btnApplyUpdate = new Button
            {
                Text = "💾 Save Physical Check-In",
                Location = new Point(20, 305),
                Width = 270,
                Height = 38,
                BackColor = Color.FromArgb(16, 185, 129),
                ForeColor = Color.White,
                FlatStyle = FlatStyle.Flat,
                Font = new Font("Segoe UI", 10f, FontStyle.Bold)
            };
            _btnApplyUpdate.Click += async (s, e) => await SaveStatusUpdateAsync();

            _lblStatusMessage = new Label
            {
                Location = new Point(20, 360),
                Width = 270,
                Height = 60,
                ForeColor = Color.FromArgb(75, 85, 99)
            };

            pnlRight.Controls.AddRange(new Control[] {
                lblInspectionTitle, lblStatus, _cmbStatusUpdate,
                lblFuel, _numFuelLevel, lblNotes, _txtConditionNotes,
                _btnApplyUpdate, _lblStatusMessage
            });

            Controls.Add(_dgvInventory);
            Controls.Add(pnlRight);
            Controls.Add(pnlTop);
        }

        private async Task RefreshInventoryAsync()
        {
            try
            {
                _btnSync!.Enabled = false;
                _lblStatusMessage!.Text = "Connecting to API...";
                _lblStatusMessage.ForeColor = Color.Blue;

                _cts?.Cancel();
                _cts = new CancellationTokenSource();

                var list = await _apiService.GetVehicleInventoryAsync(_cts.Token);
                _dgvInventory!.DataSource = list;

                _lblStatusMessage.Text = $"Loaded {list.Count} vehicles from live inventory.";
                _lblStatusMessage.ForeColor = Color.Green;
            }
            catch (Exception ex)
            {
                _lblStatusMessage!.Text = $"Error: {ex.Message}";
                _lblStatusMessage.ForeColor = Color.Red;
            }
            finally
            {
                _btnSync!.Enabled = true;
            }
        }

        private async Task PerformBarcodeLookupAsync(string query)
        {
            if (string.IsNullOrWhiteSpace(query)) return;

            try
            {
                _lblStatusMessage!.Text = "Searching by Barcode / Plate...";
                var match = await _apiService.FindVehicleByBarcodeOrPlateAsync(query);
                if (match != null)
                {
                    _lblStatusMessage.Text = $"Found: {match.Name} ({match.Status})";
                    _lblStatusMessage.ForeColor = Color.Green;
                    // Select row in grid
                    foreach (DataGridViewRow row in _dgvInventory!.Rows)
                    {
                        if (row.DataBoundItem is VehicleDto v && v.Id == match.Id)
                        {
                            row.Selected = true;
                            _dgvInventory.FirstDisplayedScrollingRowIndex = row.Index;
                            break;
                        }
                    }
                }
                else
                {
                    _lblStatusMessage.Text = "No vehicle matched barcode.";
                    _lblStatusMessage.ForeColor = Color.OrangeRed;
                }
            }
            catch (Exception ex)
            {
                _lblStatusMessage!.Text = $"Search failed: {ex.Message}";
            }
        }

        private void DgvInventory_SelectionChanged(object? sender, EventArgs e)
        {
            if (_dgvInventory?.SelectedRows.Count > 0 && _dgvInventory.SelectedRows[0].DataBoundItem is VehicleDto v)
            {
                _selectedVehicleId = v.Id;
                _cmbStatusUpdate!.SelectedItem = v.Status.ToLowerInvariant();
                _numFuelLevel!.Value = Math.Clamp(v.FuelOrBatteryLevel, 0, 100);
                _txtConditionNotes!.Text = v.ConditionNotes ?? string.Empty;
            }
        }

        private async Task SaveStatusUpdateAsync()
        {
            if (string.IsNullOrEmpty(_selectedVehicleId))
            {
                MessageBox.Show("Please select a vehicle from the grid first.", "Selection Required", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }

            try
            {
                _btnApplyUpdate!.Enabled = false;
                var status = _cmbStatusUpdate!.SelectedItem?.ToString() ?? "available";
                var fuel = (int)_numFuelLevel!.Value;
                var notes = _txtConditionNotes!.Text;

                var success = await _apiService.UpdatePhysicalStatusAsync(_selectedVehicleId, status, fuel, notes);
                if (success)
                {
                    _lblStatusMessage!.Text = "Updated status successfully!";
                    _lblStatusMessage.ForeColor = Color.Green;
                    await RefreshInventoryAsync();
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Update failed: {ex.Message}", "API Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
            finally
            {
                _btnApplyUpdate!.Enabled = true;
            }
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                _apiService.Dispose();
                _cts?.Dispose();
            }
            base.Dispose(disposing);
        }
    }
}
