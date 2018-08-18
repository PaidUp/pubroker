import moment from 'moment'
import numeral from 'numeral'

function capitalize (value) {
  return value.replace(
    /\w\S*/g,
    function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    }
  )
}

export default class CommonUtil {

}
