export function useForgotPassword() {
  const email = useState<string>('forgot-password:email', () => '')
  const resetToken = useState<string>('forgot-password:resetToken', () => '')

  function clear() {
    email.value = ''
    resetToken.value = ''
  }

  return { email, resetToken, clear }
}
