import dayjs from 'dayjs'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import quarterOfYear from 'dayjs/plugin/quarterOfYear'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import weekYear from 'dayjs/plugin/weekYear'

/**
 * 中文：显式注册日期格式化插件。`quarter` 与 `week` 等格式依赖这些插件，
 * 不能依赖 Element Plus 内部是否已经加载过日期面板。
 *
 * English: Register the dayjs plugins explicitly. Formats such as `quarter`
 * and `week` depend on them; do not rely on Element Plus having loaded its
 * date panel as a side effect.
 */
dayjs.extend(advancedFormat)
dayjs.extend(weekOfYear)
dayjs.extend(weekYear)
dayjs.extend(quarterOfYear)

export default dayjs
