const stripe = Stripe('pk_test_51MeGzbFJcSJT6puUFXnFKVodXAjaJrFWIdVmsshd3Hcd2XemiTQWzDQ0kSclyWreJbHYUZXftrzQDJd5bcShr64X00DvbH9n9l')

export const bookTour = async tourId => {
  const session = await axios(`https://natours-2x9t.onrender.com/api/v1/booking/checkout-session/${tourId}`)
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
}