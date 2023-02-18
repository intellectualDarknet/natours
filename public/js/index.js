// to polifill some features of js don't know if its actual or not
import { login, logout } from './login.js'
import { displayMap } from './mapbox.js'

const mapBox = document.getElementById('map')
const loginForm = document.querySelector('.form')
const logOutBtn = document.querySelector('.nav__el-logout')

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
console.log('btn',logOutBtn)
if (logOutBtn) logOutBtn.addEventListener('click', logout)