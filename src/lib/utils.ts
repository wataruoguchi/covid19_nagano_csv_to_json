function mkDirs(fs: any, dirPaths: string[]): void {
  dirPaths.forEach((dirName) => {
    // Create directories we'd use.
    try {
      fs.mkdirSync(dirName);
    } catch (e) {}
  });
}

export { mkDirs };
