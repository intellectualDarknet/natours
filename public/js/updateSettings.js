import { showAlert } from './alerts.js'

export const updateSettings = async (data, type) => {
  // password can be password or data
  console.log('updateSettings', data)
  try {
    const url = type === 'password' 
      ? 'http://localhost:5000/api/v1/users/updateMyPassword' 
      : 'http://localhost:5000/api/v1/users/updateMe'
    const res = await axios({
      method: 'PATCH',
      url,
      data
    })

    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updated successfully`)
      location.reload(true)
    }
  }
  catch(err) {
    console.log('stack', err.stack)
    showAlert('error', err.response)
  }
}