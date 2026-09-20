/** The parts of the File System Access API this app uses, absent from the bundled DOM types. */
interface FileSystemHandlePermissionDescriptor {
  mode?: 'read' | 'readwrite';
}

interface FileSystemFileHandle {
  queryPermission(descriptor?: FileSystemHandlePermissionDescriptor): Promise<PermissionState>;
  requestPermission(descriptor?: FileSystemHandlePermissionDescriptor): Promise<PermissionState>;
}

interface FilePickerAccept {
  description?: string;
  accept: Record<string, string[]>;
}

interface Window {
  showSaveFilePicker(options?: { suggestedName?: string; types?: FilePickerAccept[] }): Promise<FileSystemFileHandle>;
  showOpenFilePicker(options?: { types?: FilePickerAccept[]; multiple?: boolean }): Promise<FileSystemFileHandle[]>;
}
