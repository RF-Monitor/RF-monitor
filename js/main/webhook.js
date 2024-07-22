/*----------傳送webhook----------*/
function send_webhook(url,sendContent){
	if(url != ""){
		const message = {
			content: sendContent
		};
		axios.post(url, message)
			.then(response => {
				console.log('Webhook sent');
			})
			.catch(error => {
				console.error('Webhook error:', error);
			});
	}
}