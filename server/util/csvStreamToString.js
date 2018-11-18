export default (stream) => {
  return new Promise((resolve, reject) => {
    try {
      let csvString = ''
      stream.on('data', (csvBuffer) => {
        csvString = csvString + csvBuffer.toString('utf8')
      })
      stream.on('end', () => {
        resolve(csvString)
      })
    } catch (error) {
      reject(error)
    }
  })
}
