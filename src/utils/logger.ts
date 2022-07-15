export type Logger = {
  messageOnLoaded: () => void
  message: (text: string) => void
}

const color = "color: #15ea36"
const prefix = "[greedy-github]:"

export const createLogger = (): Logger => {
  return {
    messageOnLoaded: () => {
      console.info(`%c${prefix}`, color, "I'm greedy.")
    },
    message: (text: string) => {
      console.info(`%c${prefix}`, color, text)
    }
  }
}
