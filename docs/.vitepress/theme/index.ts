import DefaultTheme from 'vitepress/theme'
import DemoVideo from './DemoVideo.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('DemoVideo', DemoVideo)
  },
}
