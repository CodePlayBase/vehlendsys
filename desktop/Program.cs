using System;
using System.Windows.Forms;
using VehicleLendingSystem.Desktop.Forms;

namespace VehLenSys
{
    internal static class Program
    {
        [STAThread]
        static void Main()
        {
            ApplicationConfiguration.Initialize();
            Application.Run(new VehicleInventoryForm());
        }
    }
}