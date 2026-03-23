import DefaultTheme from 'vitepress/theme'
import DemoVideo from './DemoVideo.vue'
import TemplateGrid from './TemplateGrid.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('DemoVideo', DemoVideo)
    app.component('TemplateGrid', TemplateGrid)
  },
}
