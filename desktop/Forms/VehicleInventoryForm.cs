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
                AutoSizeColumnsMode = DataGridViewAutoSizeColumnsMode.Fill,
                RowHeadersVisible = false
            };
            _dgvInventory.SelectionChanged += DgvInventory_SelectionChanged;

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
