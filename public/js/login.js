const axios = require("axios")

const login = async (email, password) => {
  console.log(email, password)
  try {
    // we can send information from here or directly from the form
      // axious returns promise so to cathc it use await
  // only modern browsers can use async await so be aware of that
  // if there is an error axious will throw error
  const res = await axios({
    method: 'POST',
    url: 'http://localhost:5000/api/v1/users/login',
    data: {
      email,
      password
    }
  })

  if (res.data.status === 'success') {}
    alert('Logged in successfully!')
    window.setTimeout(() => {
      // to load another page
      location.assign('/')
    }, 1500)
  } catch(err) {
    // notification for the user
    alert(err.response.data.message)
  }
}

module.exports = login