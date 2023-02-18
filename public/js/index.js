// to polifill some features of js don't know if its actual or not
const login =  require('./login')
const displayMap =  require('./mapbox')

const mapBox = document.getElementById('map')
const loginForm = document.querySelector('.form')

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
