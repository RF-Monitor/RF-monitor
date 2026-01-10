export async function send_webhook(url, sendContent) {
	if (!url) return;

	try {
		const response = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				content: sendContent
			})
		});

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}`);
		}

		console.log("Webhook sent");
	} catch (error) {
		console.error("Webhook error:", error);
	}
}
