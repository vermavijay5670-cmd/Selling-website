const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN || 'YOUR_BOT_TOKEN'
const TELEGRAM_CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID || 'YOUR_CHAT_ID'

export async function sendTelegramNotification(message) {
  if (!TELEGRAM_BOT_TOKEN || TELEGRAM_BOT_TOKEN === 'YOUR_BOT_TOKEN') {
    console.log('Telegram not configured:', message)
    return
  }
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      })
    })
  } catch (err) {
    console.error('Telegram error:', err)
  }
}

export function formatOrderMessage(order) {
  const items = order.items.map(i => `  • ${i.name} x${i.quantity} = ₹${(i.price * i.quantity).toFixed(2)}`).join('\n')
  return `🛒 <b>New Order #${order.id}</b>

👤 <b>Customer:</b> ${order.customerName}
📞 <b>Phone:</b> ${order.phone}
📍 <b>Address:</b> ${order.address}

🧾 <b>Items:</b>
${items}

💰 <b>Total: ₹${order.total.toFixed(2)}</b>
🕐 <b>Time:</b> ${new Date().toLocaleString('en-IN')}
📝 <b>Notes:</b> ${order.notes || 'None'}`
}
