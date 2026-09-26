param(
    [Parameter(Mandatory = $true)][string]$AppUserModelId,
    [Parameter(Mandatory = $true)][string]$ArgumentsBase64
)
$ErrorActionPreference = 'Stop'

# A direct CreateProcess/spawn of a WindowsApps exe loses MSIX identity.
# Activate the registered app through Windows and forward the CDP switches.
Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;

[ComImport, Guid("2E941141-7F97-4756-BA1D-9DECDE894A3D"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
interface IStudioApplicationActivationManager {
    [PreserveSig] int ActivateApplication(
        [MarshalAs(UnmanagedType.LPWStr)] string appUserModelId,
        [MarshalAs(UnmanagedType.LPWStr)] string arguments,
        uint options, out uint processId);
    [PreserveSig] int ActivateForFile(IntPtr id, IntPtr items, IntPtr verb, out uint processId);
    [PreserveSig] int ActivateForProtocol(IntPtr id, IntPtr items, out uint processId);
}
public static class StudioPackageActivation {
    [DllImport("ole32.dll", ExactSpelling = true)]
    static extern int CoCreateInstance(ref Guid clsid, IntPtr outer, uint context,
        ref Guid iid, [MarshalAs(UnmanagedType.Interface)] out IStudioApplicationActivationManager manager);
    public static uint Launch(string appId, string arguments) {
        Guid clsid = new Guid("45BA127D-10A8-46EA-8AB7-56EA9078943C");
        Guid iid = typeof(IStudioApplicationActivationManager).GUID;
        IStudioApplicationActivationManager manager;
        // LOCAL_SERVER keeps activation alive after this helper exits.
        Marshal.ThrowExceptionForHR(CoCreateInstance(ref clsid, IntPtr.Zero, 4, ref iid, out manager));
        try {
            uint pid;
            Marshal.ThrowExceptionForHR(manager.ActivateApplication(appId, arguments, 2, out pid));
            return pid;
        } finally { Marshal.ReleaseComObject(manager); }
    }
}
'@
$launchArguments = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($ArgumentsBase64))
$launchedPid = [StudioPackageActivation]::Launch($AppUserModelId, $launchArguments)
@{ pid = $launchedPid } | ConvertTo-Json -Compress
