// to polifill some features of js don't know if its actual or not
import { login, logout } from './login.js'
import { updateData } from './updateSettings.js'
import { displayMap } from './mapbox.js'

const mapBox = document.getElementById('map')
const loginForm = document.querySelector('.form--login')
const logOutBtn = document.querySelector('.nav__el-logout')
const userDataForm = document.querySelector('.form-user-data')

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
    updateData(name, email)
  })
}

if (logOutBtn) logOutBtn.addEventListener('click', logout)

