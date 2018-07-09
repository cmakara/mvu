this.getVersionComponents = (version) => {
  const versionRegexp = /(\d+)\.(\d+)\.(\d+)/g
  return versionRegexp.exec(version).slice(1).map(versionComponent => parseInt(versionComponent))
}

this.getNewVersion = async (version, level) => {
  const [major, minor, patch] = getVersionComponents(version)
  switch (level) {
    case 'major':
      return `${major + 1}.0.0`
    case 'minor':
      return `${major}.${minor + 1}.0`
    case 'patch':
      return `${major}.${minor}.${patch + 1}`
  }
}
