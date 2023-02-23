import { showAlert } from './alerts.js'

export const login = async (email, password) => {
  try {
    // we can send information from here or directly from the form
      // axious returns promise so to cathc it use await
  // only modern browsers can use async await so be aware of that
  // if there is an error axious will throw error
  const res = await axios({
    method: 'POST',
    url: '/api/v1/users/login',
    data: {
      email,
      password
    }
  })

  if (res.data.status === 'success') {
    showAlert('success', 'Logged in successfully!')
    window.setTimeout(() => {
      location.assign('/')
    }, 1500)
  }} 
  catch(err) {
    showAlert('error', err.response.data.message)
  }
}

export const logout = async () => {
    // try catch block if we lose internet connection
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout',
    })
    // we are logged out but we see the same structire (conditional rendering)
    // reload
    if (res.data.status = 'success') location.reload(true)
  }
  catch(err) {
    showAlert('error', err.message)
  }
}