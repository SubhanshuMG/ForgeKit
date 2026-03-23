import DefaultTheme from 'vitepress/theme'
import DemoVideo from './DemoVideo.vue'
import FeatureCards from './FeatureCards.vue'
import TemplateGrid from './TemplateGrid.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('DemoVideo', DemoVideo)
    app.component('FeatureCards', FeatureCards)
    app.component('TemplateGrid', TemplateGrid)
  },
}
