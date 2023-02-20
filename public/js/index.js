// to polifill some features of js don't know if its actual or not
import { login, logout } from './login.js'
import { updateSettings } from './updateSettings.js'
import { displayMap } from './mapbox.js'

const mapBox = document.getElementById('map')
const loginForm = document.querySelector('.form--login')
const logOutBtn = document.querySelector('.nav__el-logout')
const userDataForm = document.querySelector('.form-user-data')
const userPasswordForm = document.querySelector('.form-user-password')

if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations)
// separate responsibilities!
  displayMap(locations)

  document.querySelector('.form').addEventListener('submit', (e) => {
    e.preventDefault();

    login(email, password)

  })
}

if (loginForm) {
  loginForm.addEventListener('submit', e => {
    e.preventDefault()
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value
    login(email, password)
  })
}

if (userDataForm) {
  userDataForm.addEventListener('submit', e => {
    e.preventDefault()
    const name = document.getElementById('name').value
    const email = document.getElementById('email').value
    updateSettings({name, email}, 'data')
  })
}

if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', async e => {
    e.preventDefault()
    const passwordCurrent = document.getElementById('password-current').value
    const password = document.getElementById('password').value
    const passwordConfirm = document.getElementById('password-confirm').value
    document.querySelector('.btn--save-password').textContent = 'Updating...'

    console.log('password', { passwordCurrent, password, passwordConfirm })
    // async function returns promise so we catch it and set values in the fields to ''
    await updateSettings({ passwordCurrent, password, passwordConfirm }, 'password')

    document.querySelector('.btn--save-password').textContent = 'Save password'
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  })
}

if (logOutBtn) logOutBtn.addEventListener('click', logout)

