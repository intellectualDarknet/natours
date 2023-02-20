import { showAlert } from './alerts.js'

export const updateData = async (name, email) => {
  console.log('updateSettings', name, email)
  try {
    const res = await axios({
      method: 'PATCH',
      url: 'http://localhost:5000/api/v1/users/updateMe',
      data: {
        name,
        email
      } 
    })

    if (res.data.status = 'success') {
      showAlert('success', 'data updated successfully')
      location.reload(true)
    }
  }
  catch(err) {
    console.log(err.stack)
    showAlert('error', err.response.data.message)
  }
}