import { MongoClient } from 'mongodb'
import { Logger } from 'pu-common'

export default class Mongo {
  static connect (conf) {
    return new Promise((resolve, reject) => {
      MongoClient.connect(conf.url, {useNewUrlParser: true}, (err, cli) => {
        Mongo.client = cli
        const db = conf.db
        const prefix = conf.prefix
        if (err) return reject(err)
        Mongo.collections = {}
        Mongo.collections['preoderAssignmentFile'] = cli.db(db).collection(prefix + 'preorder_assignment_file')
        Mongo.collections['preoderAssignmentRow'] = cli.db(db).collection(prefix + 'preorder_assignment_row')
        resolve(cli)
        Logger.info('connected to db: ' + db)
      })
    })
  }

  static get preoderAssignmentFileCollection () {
    return Mongo.collections.preoderAssignmentFile
  }

  static get preoderAssignmentRowCollection () {
    return Mongo.collections.preoderAssignmentRow
  }
}
