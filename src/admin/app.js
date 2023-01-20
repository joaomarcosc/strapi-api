import Logo from "./extensions/logo.png"
import favicon from "./extensions/favicon.svg"

export default {
  config: {
    locales: [
      // 'ar',
      // 'fr',
      // 'cs',
      // 'de',
      // 'dk',
      // 'es',
      // 'he',
      // 'id',
      // 'it',
      // 'ja',
      // 'ko',
      // 'ms',
      // 'nl',
      // 'no',
      // 'pl',
      'pt-BR',
      // 'pt',
      // 'ru',
      // 'sk',
      // 'sv',
      // 'th',
      // 'tr',
      // 'uk',
      // 'vi',
      // 'zh-Hans',
      // 'zh',
    ],
    head: {
      favicon
    },
    auth: {
      logo: Logo
    },
    menu: {
      logo: favicon
    },
    translations: {
      en: {
        "Auth.form.welcome.subtitle": "Log in to your account",
        "Auth.form.welcome.title": "Welcome!",
      },
      "pt-BR": {
        // Form
        "Auth.form.welcome.subtitle": "Entra na sua conta",
        "Auth.form.welcome.title": "Bem-vindo(a)!",

        // LeftMenu
        "app.components.LeftMenu.navbrand.title": "Painel Wongames",
        "app.components.LeftMenu.navbrand.workplace": "Local de trabalho",
      },

    },
    tutorials: false,
    notifications: { releases: false }
  },
  bootstrap(app) {
    document.title = "Dashboard"
    console.log(app);
  },
};
