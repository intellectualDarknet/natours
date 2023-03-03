
// type success or error
export const showAlert = (type, msg, time = 7) => {
  // just to make sure
  hideAlert()

  const markUp = `<div class="alert alert-${type}">${msg}<div/>`
  document.querySelector('body').insertAdjacentHTML('afterbegin', markUp)

  // hide alert
  window.setTimeout(hideAlert, time * 1000)
}

export const hideAlert = () => {
  const el = document.querySelector('.alert')
  // красиво !
  if (el) el.parentElement.removeChild(el)
}