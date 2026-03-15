export default defineAppConfig({
  ui: {
    colors: {
      primary: 'violet',
      neutral: 'zinc',
    },

    button: {
      slots: {
        base: 'font-medium cursor-pointer',
      },
    },

    badge: {
      slots: {
        base: 'font-medium',
      },
    },

    card: {
      slots: {
        root: 'rounded-xl',
      },
    },

    input: {
      slots: {
        base: 'font-sans',
      },
    },
  },
})
