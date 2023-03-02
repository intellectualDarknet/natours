import { showAlert } from './alerts.js'

export const login = async (email, password) => {
  try {
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
    if (res.data.status = 'success') location.assign('/')
  }
  catch(err) {
    showAlert('error', err.message)
  }
}

export const signup = async (name, email, password, passwordConfirm) => {
  console.log(name, email, password, passwordConfirm)
  try {
  const res = await axios({
    method: 'POST',
    url: '/api/v1/users/signup',
    data: {
      name,
      email,
      password,
      passwordConfirm
    }
  })
  if (res.data.status === 'success') {
    showAlert('success', 'signed up successfully!')
    window.setTimeout(() => {
      location.assign('/')
    }, 1500)
  }} 
  catch(err) {
    let errToShow = err.response.data.message
    if (err.response.data.message.includes('E11000 duplicate key error')) errToShow = 'This email is already taken'
    showAlert('error', errToShow)
  }
}