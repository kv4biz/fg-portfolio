// src/services/temp-storage-service.ts
export class TempStorageService {
  private static storage = new Map<string, File[]>();

  static addFiles(portfolioId: string, files: File[]) {
    const existing = this.storage.get(portfolioId) || [];
    this.storage.set(portfolioId, [...existing, ...files]);
  }

  static getFiles(portfolioId: string): File[] {
    return this.storage.get(portfolioId) || [];
  }

  static clearFiles(portfolioId: string) {
    this.storage.delete(portfolioId);
  }

  static removeFile(portfolioId: string, fileIndex: number) {
    const files = this.storage.get(portfolioId);
    if (files) {
      files.splice(fileIndex, 1);
      this.storage.set(portfolioId, files);
    }
  }
}
