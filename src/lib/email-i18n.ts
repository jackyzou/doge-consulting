// ══════════════════════════════════════════════════════════════
// Email Internationalization — All user-facing email strings
// Supports: en, zh-CN, zh-TW, es, fr
// ══════════════════════════════════════════════════════════════

export type EmailLocale = "en" | "zh-CN" | "zh-TW" | "es" | "fr";

export interface EmailStrings {
  // Template chrome
  companyName: string;
  tagline: string;
  footerCompany: string;
  footerAutoNotice: string;
  footerHelp: string;

  // Common
  hi: string; // "Hi {name}"
  orderNumber: string;
  quoteNumber: string;
  status: string;
  amount: string;
  total: string;
  items: string;
  destination: string;
  deliveryType: string;
  estimatedCost: string;
  estimatedDelivery: string;
  trackingId: string;
  vessel: string;
  deposit: string;
  balanceDue: string;
  method: string;
  type: string;
  customer: string;
  whatHappensNext: string;
  viewMyAccount: string;
  viewMyOrders: string;
  trackMyOrder: string;
  payNow: string;
  payDepositNow: string;
  contactUs: string;

  // Quote requested
  quoteRequestReceived: string;
  quoteRequestReceivedDesc: string;
  itemsInQuote: string;
  quoteNextSteps: string;

  // Quote sent
  quoteReady: string;
  quoteReadyDesc: string;
  quoteValidDays: string;
  depositPercent: string;
  securePayment: string;

  // Payment link
  paymentRequired: string;
  paymentRequiredDesc: string;
  amountDue: string;
  securedBy: string;
  accepted: string;
  linkTrouble: string;

  // Payment received
  paymentConfirmed: string;
  paymentConfirmedDesc: string;
  receiptAvailable: string;

  // Order confirmed
  orderConfirmed: string;
  orderConfirmedDesc: string;
  orderNextSteps1: string;
  orderNextSteps2: string;
  orderNextSteps3: string;

  // Order status
  orderStatusUpdate: string;
  noteFromTeam: string;
  trackShipmentAt: string;

  // Order closed
  orderComplete: string;
  orderCompleteDesc: string;
  feedbackTitle: string;
  feedbackDesc: string;
  deliveryIssue: string;

  // Status labels
  statusPending: string;
  statusConfirmed: string;
  statusSourcing: string;
  statusPacking: string;
  statusInTransit: string;
  statusCustoms: string;
  statusDelivered: string;
  statusClosed: string;
  statusCancelled: string;

  // Status messages
  msgPending: string;
  msgConfirmed: string;
  msgSourcing: string;
  msgPacking: string;
  msgInTransit: string;
  msgCustoms: string;
  msgDelivered: string;
  msgClosed: string;
  msgCancelled: string;

  // Progress tracker
  progressConfirmed: string;
  progressSourcing: string;
  progressPacking: string;
  progressInTransit: string;
  progressCustoms: string;
  progressDelivered: string;

  // Admin subjects (keep in English for admin)
  adminNewQuote: string;
  adminQuoteSent: string;
  adminPaymentReceived: string;
  adminOrderConfirmed: string;
  adminOrderStatusChanged: string;
}

const en: EmailStrings = {
  companyName: "Doge Consulting Group",
  tagline: "Premium Shipping from China to USA",
  footerCompany: "Doge Consulting Group Limited · Hong Kong",
  footerAutoNotice: "This is an automated notification. Please do not reply directly to this email.",
  footerHelp: "Need help? Contact us at",

  hi: "Hi {name}",
  orderNumber: "Order Number",
  quoteNumber: "Quote Number",
  status: "Status",
  amount: "Amount",
  total: "Total",
  items: "Items",
  destination: "Destination",
  deliveryType: "Delivery Type",
  estimatedCost: "Estimated Cost",
  estimatedDelivery: "Est. Delivery",
  trackingId: "Tracking ID",
  vessel: "Vessel",
  deposit: "Deposit Paid",
  balanceDue: "Balance Due",
  method: "Method",
  type: "Type",
  customer: "Customer",
  whatHappensNext: "What happens next?",
  viewMyAccount: "View My Account",
  viewMyOrders: "View My Orders",
  trackMyOrder: "Track My Order",
  payNow: "Pay Now",
  payDepositNow: "💳 Pay Deposit Now",
  contactUs: "If you have any questions, feel free to contact us.",

  quoteRequestReceived: "Quote Request Received",
  quoteRequestReceivedDesc: "we've received your shipping quote request!",
  itemsInQuote: "Items in your quote:",
  quoteNextSteps: "Our team will review your request and send you a detailed quote with final pricing within 1–2 business days.",

  quoteReady: "Your Quote is Ready!",
  quoteReadyDesc: "here's your finalized shipping quote:",
  quoteValidDays: "This quote is valid for 30 days. If you have questions, reply to this email or contact us.",
  depositPercent: "To proceed, pay the 70% deposit:",
  securePayment: "Secure payment via Airwallex · Credit Card, Debit, ACH, Wire",

  paymentRequired: "Payment Required",
  paymentRequiredDesc: "please complete your payment to proceed with your order.",
  amountDue: "Amount Due",
  securedBy: "Secured by Airwallex · 256-bit SSL encryption",
  accepted: "Accepted: Visa · Mastercard · Amex · UnionPay · ACH · Wire",
  linkTrouble: "If you have trouble with the button above, copy and paste this link:",

  paymentConfirmed: "Payment Confirmed",
  paymentConfirmedDesc: "we've successfully received your payment!",
  receiptAvailable: "A receipt has been generated and is available in your account.",

  orderConfirmed: "Order Confirmed!",
  orderConfirmedDesc: "great news! Your order has been confirmed and is now being processed.",
  orderNextSteps1: "Our team will begin sourcing your products from verified suppliers",
  orderNextSteps2: "You'll receive email updates at every milestone",
  orderNextSteps3: "Track your order anytime from your account dashboard",

  orderStatusUpdate: "Order Status Update",
  noteFromTeam: "Note from our team:",
  trackShipmentAt: "You can also track your shipment at",

  orderComplete: "Order Complete!",
  orderCompleteDesc: "has been delivered and is now complete. Thank you for choosing Doge Consulting!",
  feedbackTitle: "How was your experience?",
  feedbackDesc: "We'd love to hear from you! Please contact us if you have any feedback.",
  deliveryIssue: "If you have any issues with your delivery, please contact us within 30 days.",

  statusPending: "Pending Review",
  statusConfirmed: "Order Confirmed",
  statusSourcing: "Sourcing Products",
  statusPacking: "Packing & Preparing",
  statusInTransit: "In Transit",
  statusCustoms: "Customs Clearance",
  statusDelivered: "Delivered",
  statusClosed: "Order Completed",
  statusCancelled: "Order Cancelled",

  msgPending: "Your order is pending review by our team.",
  msgConfirmed: "Your order has been confirmed and we're getting started!",
  msgSourcing: "We're actively sourcing your products from our network of verified Chinese suppliers.",
  msgPacking: "Your products have been received and are being carefully packed and prepared for shipping.",
  msgInTransit: "Your shipment is on its way! It's currently in transit from China to the USA.",
  msgCustoms: "Your shipment has arrived and is currently going through customs clearance.",
  msgDelivered: "Great news! Your shipment has been delivered. Please inspect your goods.",
  msgClosed: "Your order is complete. Thank you for choosing Doge Consulting!",
  msgCancelled: "Your order has been cancelled. If you have questions, please contact us.",

  progressConfirmed: "Confirmed",
  progressSourcing: "Sourcing",
  progressPacking: "Packing",
  progressInTransit: "In Transit",
  progressCustoms: "Customs",
  progressDelivered: "Delivered",

  adminNewQuote: "New Quote Request",
  adminQuoteSent: "Quote Sent",
  adminPaymentReceived: "Payment Received",
  adminOrderConfirmed: "New Order Confirmed",
  adminOrderStatusChanged: "Order Status Changed",
};

const zhCN: EmailStrings = {
  companyName: "多吉咨询集团",
  tagline: "中国到美国优质货运服务",
  footerCompany: "多吉咨询集团有限公司 · 香港",
  footerAutoNotice: "这是一封自动通知邮件，请勿直接回复。",
  footerHelp: "需要帮助？请联系我们：",

  hi: "{name}，您好",
  orderNumber: "订单编号",
  quoteNumber: "报价编号",
  status: "状态",
  amount: "金额",
  total: "总计",
  items: "商品",
  destination: "目的地",
  deliveryType: "配送方式",
  estimatedCost: "预估费用",
  estimatedDelivery: "预计到达",
  trackingId: "物流单号",
  vessel: "船名",
  deposit: "已付定金",
  balanceDue: "待付尾款",
  method: "支付方式",
  type: "类型",
  customer: "客户",
  whatHappensNext: "接下来会怎样？",
  viewMyAccount: "查看我的账户",
  viewMyOrders: "查看我的订单",
  trackMyOrder: "追踪我的订单",
  payNow: "立即支付",
  payDepositNow: "💳 支付定金",
  contactUs: "如有任何问题，请随时联系我们。",

  quoteRequestReceived: "报价请求已收到",
  quoteRequestReceivedDesc: "我们已收到您的运费报价请求！",
  itemsInQuote: "您的报价包含以下商品：",
  quoteNextSteps: "我们的团队将审核您的需求，并在1-2个工作日内发送详细报价。",

  quoteReady: "您的报价已准备好！",
  quoteReadyDesc: "以下是您的最终运费报价：",
  quoteValidDays: "此报价有效期为30天。如有疑问，请回复此邮件或联系我们。",
  depositPercent: "请支付70%定金以继续：",
  securePayment: "通过Airwallex安全支付 · 信用卡、借记卡、ACH、电汇",

  paymentRequired: "需要付款",
  paymentRequiredDesc: "请完成付款以继续处理您的订单。",
  amountDue: "应付金额",
  securedBy: "由Airwallex提供安全保障 · 256位SSL加密",
  accepted: "支持：Visa · Mastercard · Amex · 银联 · ACH · 电汇",
  linkTrouble: "如果按钮无法使用，请复制并粘贴以下链接：",

  paymentConfirmed: "付款确认",
  paymentConfirmedDesc: "我们已成功收到您的付款！",
  receiptAvailable: "收据已生成，您可以在账户中查看。",

  orderConfirmed: "订单已确认！",
  orderConfirmedDesc: "好消息！您的订单已确认，正在处理中。",
  orderNextSteps1: "我们的团队将开始从认证供应商处采购您的产品",
  orderNextSteps2: "每个里程碑节点我们都会发送邮件通知",
  orderNextSteps3: "您可以随时在账户仪表板中追踪订单",

  orderStatusUpdate: "订单状态更新",
  noteFromTeam: "团队备注：",
  trackShipmentAt: "您也可以在以下地址追踪物流：",

  orderComplete: "订单已完成！",
  orderCompleteDesc: "已交付完成。感谢您选择多吉咨询！",
  feedbackTitle: "您的体验如何？",
  feedbackDesc: "我们希望听到您的反馈！如有任何意见请联系我们。",
  deliveryIssue: "如有任何交付问题，请在30天内联系我们。",

  statusPending: "待审核",
  statusConfirmed: "订单已确认",
  statusSourcing: "产品采购中",
  statusPacking: "打包准备中",
  statusInTransit: "运输中",
  statusCustoms: "清关中",
  statusDelivered: "已送达",
  statusClosed: "订单完成",
  statusCancelled: "订单已取消",

  msgPending: "您的订单正在等待团队审核。",
  msgConfirmed: "您的订单已确认，我们已开始处理！",
  msgSourcing: "我们正在从认证的中国供应商网络中采购您的产品。",
  msgPacking: "您的产品已收到，正在仔细打包并准备发运。",
  msgInTransit: "您的货物已经在路上了！目前正从中国运往美国。",
  msgCustoms: "您的货物已到达，目前正在进行海关清关。",
  msgDelivered: "好消息！您的货物已送达，请检查您的商品。",
  msgClosed: "您的订单已完成。感谢您选择多吉咨询！",
  msgCancelled: "您的订单已取消。如有疑问，请联系我们。",

  progressConfirmed: "已确认",
  progressSourcing: "采购中",
  progressPacking: "打包中",
  progressInTransit: "运输中",
  progressCustoms: "清关中",
  progressDelivered: "已送达",

  adminNewQuote: "New Quote Request",
  adminQuoteSent: "Quote Sent",
  adminPaymentReceived: "Payment Received",
  adminOrderConfirmed: "New Order Confirmed",
  adminOrderStatusChanged: "Order Status Changed",
};

const zhTW: EmailStrings = {
  companyName: "多吉諮詢集團",
  tagline: "中國到美國優質貨運服務",
  footerCompany: "多吉諮詢集團有限公司 · 香港",
  footerAutoNotice: "這是一封自動通知郵件，請勿直接回覆。",
  footerHelp: "需要幫助？請聯繫我們：",

  hi: "{name}，您好",
  orderNumber: "訂單編號",
  quoteNumber: "報價編號",
  status: "狀態",
  amount: "金額",
  total: "總計",
  items: "商品",
  destination: "目的地",
  deliveryType: "配送方式",
  estimatedCost: "預估費用",
  estimatedDelivery: "預計到達",
  trackingId: "物流單號",
  vessel: "船名",
  deposit: "已付訂金",
  balanceDue: "待付尾款",
  method: "支付方式",
  type: "類型",
  customer: "客戶",
  whatHappensNext: "接下來會怎樣？",
  viewMyAccount: "查看我的帳戶",
  viewMyOrders: "查看我的訂單",
  trackMyOrder: "追蹤我的訂單",
  payNow: "立即支付",
  payDepositNow: "💳 支付訂金",
  contactUs: "如有任何問題，請隨時聯繫我們。",

  quoteRequestReceived: "報價請求已收到",
  quoteRequestReceivedDesc: "我們已收到您的運費報價請求！",
  itemsInQuote: "您的報價包含以下商品：",
  quoteNextSteps: "我們的團隊將審核您的需求，並在1-2個工作日內發送詳細報價。",

  quoteReady: "您的報價已準備好！",
  quoteReadyDesc: "以下是您的最終運費報價：",
  quoteValidDays: "此報價有效期為30天。如有疑問，請回覆此郵件或聯繫我們。",
  depositPercent: "請支付70%訂金以繼續：",
  securePayment: "透過Airwallex安全支付 · 信用卡、簽帳卡、ACH、電匯",

  paymentRequired: "需要付款",
  paymentRequiredDesc: "請完成付款以繼續處理您的訂單。",
  amountDue: "應付金額",
  securedBy: "由Airwallex提供安全保障 · 256位SSL加密",
  accepted: "支援：Visa · Mastercard · Amex · 銀聯 · ACH · 電匯",
  linkTrouble: "如果按鈕無法使用，請複製並貼上以下連結：",

  paymentConfirmed: "付款確認",
  paymentConfirmedDesc: "我們已成功收到您的付款！",
  receiptAvailable: "收據已產生，您可以在帳戶中查看。",

  orderConfirmed: "訂單已確認！",
  orderConfirmedDesc: "好消息！您的訂單已確認，正在處理中。",
  orderNextSteps1: "我們的團隊將開始從認證供應商處採購您的產品",
  orderNextSteps2: "每個里程碑節點我們都會發送郵件通知",
  orderNextSteps3: "您可以隨時在帳戶儀表板中追蹤訂單",

  orderStatusUpdate: "訂單狀態更新",
  noteFromTeam: "團隊備註：",
  trackShipmentAt: "您也可以在以下地址追蹤物流：",

  orderComplete: "訂單已完成！",
  orderCompleteDesc: "已交付完成。感謝您選擇多吉諮詢！",
  feedbackTitle: "您的體驗如何？",
  feedbackDesc: "我們希望聽到您的回饋！如有任何意見請聯繫我們。",
  deliveryIssue: "如有任何交付問題，請在30天內聯繫我們。",

  statusPending: "待審核",
  statusConfirmed: "訂單已確認",
  statusSourcing: "產品採購中",
  statusPacking: "打包準備中",
  statusInTransit: "運輸中",
  statusCustoms: "清關中",
  statusDelivered: "已送達",
  statusClosed: "訂單完成",
  statusCancelled: "訂單已取消",

  msgPending: "您的訂單正在等待團隊審核。",
  msgConfirmed: "您的訂單已確認，我們已開始處理！",
  msgSourcing: "我們正在從認證的中國供應商網絡中採購您的產品。",
  msgPacking: "您的產品已收到，正在仔細打包並準備發運。",
  msgInTransit: "您的貨物已經在路上了！目前正從中國運往美國。",
  msgCustoms: "您的貨物已到達，目前正在進行海關清關。",
  msgDelivered: "好消息！您的貨物已送達，請檢查您的商品。",
  msgClosed: "您的訂單已完成。感謝您選擇多吉諮詢！",
  msgCancelled: "您的訂單已取消。如有疑問，請聯繫我們。",

  progressConfirmed: "已確認",
  progressSourcing: "採購中",
  progressPacking: "打包中",
  progressInTransit: "運輸中",
  progressCustoms: "清關中",
  progressDelivered: "已送達",

  adminNewQuote: "New Quote Request",
  adminQuoteSent: "Quote Sent",
  adminPaymentReceived: "Payment Received",
  adminOrderConfirmed: "New Order Confirmed",
  adminOrderStatusChanged: "Order Status Changed",
};

const es: EmailStrings = {
  companyName: "Doge Consulting Group",
  tagline: "Envío Premium de China a EE.UU.",
  footerCompany: "Doge Consulting Group Limited · Hong Kong",
  footerAutoNotice: "Esta es una notificación automática. Por favor, no responda directamente a este correo.",
  footerHelp: "¿Necesita ayuda? Contáctenos en",

  hi: "Hola {name}",
  orderNumber: "Número de Pedido",
  quoteNumber: "Número de Cotización",
  status: "Estado",
  amount: "Monto",
  total: "Total",
  items: "Artículos",
  destination: "Destino",
  deliveryType: "Tipo de Entrega",
  estimatedCost: "Costo Estimado",
  estimatedDelivery: "Entrega Estimada",
  trackingId: "ID de Seguimiento",
  vessel: "Embarcación",
  deposit: "Depósito Pagado",
  balanceDue: "Saldo Pendiente",
  method: "Método",
  type: "Tipo",
  customer: "Cliente",
  whatHappensNext: "¿Qué sucede después?",
  viewMyAccount: "Ver Mi Cuenta",
  viewMyOrders: "Ver Mis Pedidos",
  trackMyOrder: "Rastrear Mi Pedido",
  payNow: "Pagar Ahora",
  payDepositNow: "💳 Pagar Depósito",
  contactUs: "Si tiene alguna pregunta, no dude en contactarnos.",

  quoteRequestReceived: "Solicitud de Cotización Recibida",
  quoteRequestReceivedDesc: "¡hemos recibido su solicitud de cotización de envío!",
  itemsInQuote: "Artículos en su cotización:",
  quoteNextSteps: "Nuestro equipo revisará su solicitud y le enviará una cotización detallada con precios finales en 1-2 días hábiles.",

  quoteReady: "¡Su Cotización está Lista!",
  quoteReadyDesc: "aquí está su cotización de envío finalizada:",
  quoteValidDays: "Esta cotización es válida por 30 días. Si tiene preguntas, responda a este correo o contáctenos.",
  depositPercent: "Para continuar, pague el 70% de depósito:",
  securePayment: "Pago seguro vía Airwallex · Tarjeta de Crédito, Débito, ACH, Transferencia",

  paymentRequired: "Pago Requerido",
  paymentRequiredDesc: "por favor complete su pago para continuar con su pedido.",
  amountDue: "Monto Adeudado",
  securedBy: "Asegurado por Airwallex · Encriptación SSL de 256 bits",
  accepted: "Aceptamos: Visa · Mastercard · Amex · UnionPay · ACH · Transferencia",
  linkTrouble: "Si tiene problemas con el botón, copie y pegue este enlace:",

  paymentConfirmed: "Pago Confirmado",
  paymentConfirmedDesc: "¡hemos recibido su pago exitosamente!",
  receiptAvailable: "Se ha generado un recibo disponible en su cuenta.",

  orderConfirmed: "¡Pedido Confirmado!",
  orderConfirmedDesc: "¡buenas noticias! Su pedido ha sido confirmado y está siendo procesado.",
  orderNextSteps1: "Nuestro equipo comenzará a buscar sus productos de proveedores verificados",
  orderNextSteps2: "Recibirá actualizaciones por correo en cada hito",
  orderNextSteps3: "Rastree su pedido en cualquier momento desde su panel de cuenta",

  orderStatusUpdate: "Actualización de Estado del Pedido",
  noteFromTeam: "Nota de nuestro equipo:",
  trackShipmentAt: "También puede rastrear su envío en",

  orderComplete: "¡Pedido Completado!",
  orderCompleteDesc: "ha sido entregado y está completo. ¡Gracias por elegir Doge Consulting!",
  feedbackTitle: "¿Cómo fue su experiencia?",
  feedbackDesc: "¡Nos encantaría saber de usted! Contáctenos si tiene algún comentario.",
  deliveryIssue: "Si tiene algún problema con su entrega, contáctenos dentro de 30 días.",

  statusPending: "Revisión Pendiente",
  statusConfirmed: "Pedido Confirmado",
  statusSourcing: "Buscando Productos",
  statusPacking: "Empacando y Preparando",
  statusInTransit: "En Tránsito",
  statusCustoms: "Despacho Aduanero",
  statusDelivered: "Entregado",
  statusClosed: "Pedido Completado",
  statusCancelled: "Pedido Cancelado",

  msgPending: "Su pedido está pendiente de revisión por nuestro equipo.",
  msgConfirmed: "¡Su pedido ha sido confirmado y estamos comenzando!",
  msgSourcing: "Estamos buscando activamente sus productos en nuestra red de proveedores chinos verificados.",
  msgPacking: "Sus productos han sido recibidos y se están empacando cuidadosamente para el envío.",
  msgInTransit: "¡Su envío está en camino! Actualmente en tránsito de China a EE.UU.",
  msgCustoms: "Su envío ha llegado y está pasando por el despacho aduanero.",
  msgDelivered: "¡Buenas noticias! Su envío ha sido entregado. Por favor inspeccione sus productos.",
  msgClosed: "Su pedido está completo. ¡Gracias por elegir Doge Consulting!",
  msgCancelled: "Su pedido ha sido cancelado. Si tiene preguntas, contáctenos.",

  progressConfirmed: "Confirmado",
  progressSourcing: "Búsqueda",
  progressPacking: "Empaque",
  progressInTransit: "En Tránsito",
  progressCustoms: "Aduanas",
  progressDelivered: "Entregado",

  adminNewQuote: "New Quote Request",
  adminQuoteSent: "Quote Sent",
  adminPaymentReceived: "Payment Received",
  adminOrderConfirmed: "New Order Confirmed",
  adminOrderStatusChanged: "Order Status Changed",
};

const fr: EmailStrings = {
  companyName: "Doge Consulting Group",
  tagline: "Expédition Premium de Chine vers les États-Unis",
  footerCompany: "Doge Consulting Group Limited · Hong Kong",
  footerAutoNotice: "Ceci est une notification automatique. Veuillez ne pas répondre directement à cet e-mail.",
  footerHelp: "Besoin d'aide ? Contactez-nous à",

  hi: "Bonjour {name}",
  orderNumber: "Numéro de Commande",
  quoteNumber: "Numéro de Devis",
  status: "Statut",
  amount: "Montant",
  total: "Total",
  items: "Articles",
  destination: "Destination",
  deliveryType: "Type de Livraison",
  estimatedCost: "Coût Estimé",
  estimatedDelivery: "Livraison Estimée",
  trackingId: "ID de Suivi",
  vessel: "Navire",
  deposit: "Acompte Payé",
  balanceDue: "Solde Dû",
  method: "Méthode",
  type: "Type",
  customer: "Client",
  whatHappensNext: "Et maintenant ?",
  viewMyAccount: "Voir Mon Compte",
  viewMyOrders: "Voir Mes Commandes",
  trackMyOrder: "Suivre Ma Commande",
  payNow: "Payer Maintenant",
  payDepositNow: "💳 Payer l'Acompte",
  contactUs: "Si vous avez des questions, n'hésitez pas à nous contacter.",

  quoteRequestReceived: "Demande de Devis Reçue",
  quoteRequestReceivedDesc: "nous avons bien reçu votre demande de devis d'expédition !",
  itemsInQuote: "Articles dans votre devis :",
  quoteNextSteps: "Notre équipe examinera votre demande et vous enverra un devis détaillé avec les prix finaux sous 1 à 2 jours ouvrables.",

  quoteReady: "Votre Devis est Prêt !",
  quoteReadyDesc: "voici votre devis d'expédition finalisé :",
  quoteValidDays: "Ce devis est valable 30 jours. Si vous avez des questions, répondez à cet e-mail ou contactez-nous.",
  depositPercent: "Pour continuer, payez l'acompte de 70% :",
  securePayment: "Paiement sécurisé via Airwallex · Carte de Crédit, Débit, ACH, Virement",

  paymentRequired: "Paiement Requis",
  paymentRequiredDesc: "veuillez compléter votre paiement pour poursuivre votre commande.",
  amountDue: "Montant Dû",
  securedBy: "Sécurisé par Airwallex · Chiffrement SSL 256 bits",
  accepted: "Acceptés : Visa · Mastercard · Amex · UnionPay · ACH · Virement",
  linkTrouble: "Si le bouton ne fonctionne pas, copiez et collez ce lien :",

  paymentConfirmed: "Paiement Confirmé",
  paymentConfirmedDesc: "nous avons bien reçu votre paiement !",
  receiptAvailable: "Un reçu a été généré et est disponible dans votre compte.",

  orderConfirmed: "Commande Confirmée !",
  orderConfirmedDesc: "bonne nouvelle ! Votre commande a été confirmée et est en cours de traitement.",
  orderNextSteps1: "Notre équipe va commencer à approvisionner vos produits auprès de fournisseurs vérifiés",
  orderNextSteps2: "Vous recevrez des mises à jour par e-mail à chaque étape",
  orderNextSteps3: "Suivez votre commande à tout moment depuis votre tableau de bord",

  orderStatusUpdate: "Mise à Jour du Statut de Commande",
  noteFromTeam: "Note de notre équipe :",
  trackShipmentAt: "Vous pouvez également suivre votre envoi sur",

  orderComplete: "Commande Terminée !",
  orderCompleteDesc: "a été livrée et est terminée. Merci d'avoir choisi Doge Consulting !",
  feedbackTitle: "Comment était votre expérience ?",
  feedbackDesc: "Nous aimerions avoir votre avis ! Contactez-nous si vous avez des commentaires.",
  deliveryIssue: "Si vous avez des problèmes avec votre livraison, contactez-nous dans les 30 jours.",

  statusPending: "En Attente de Révision",
  statusConfirmed: "Commande Confirmée",
  statusSourcing: "Approvisionnement",
  statusPacking: "Emballage et Préparation",
  statusInTransit: "En Transit",
  statusCustoms: "Dédouanement",
  statusDelivered: "Livré",
  statusClosed: "Commande Terminée",
  statusCancelled: "Commande Annulée",

  msgPending: "Votre commande est en attente de révision par notre équipe.",
  msgConfirmed: "Votre commande a été confirmée et nous commençons !",
  msgSourcing: "Nous recherchons activement vos produits auprès de notre réseau de fournisseurs chinois vérifiés.",
  msgPacking: "Vos produits ont été reçus et sont soigneusement emballés pour l'expédition.",
  msgInTransit: "Votre envoi est en route ! Il est actuellement en transit de la Chine vers les États-Unis.",
  msgCustoms: "Votre envoi est arrivé et passe actuellement le dédouanement.",
  msgDelivered: "Bonne nouvelle ! Votre envoi a été livré. Veuillez inspecter vos marchandises.",
  msgClosed: "Votre commande est terminée. Merci d'avoir choisi Doge Consulting !",
  msgCancelled: "Votre commande a été annulée. Si vous avez des questions, contactez-nous.",

  progressConfirmed: "Confirmé",
  progressSourcing: "Appro.",
  progressPacking: "Emballage",
  progressInTransit: "En Transit",
  progressCustoms: "Douanes",
  progressDelivered: "Livré",

  adminNewQuote: "New Quote Request",
  adminQuoteSent: "Quote Sent",
  adminPaymentReceived: "Payment Received",
  adminOrderConfirmed: "New Order Confirmed",
  adminOrderStatusChanged: "Order Status Changed",
};

const allEmailMessages: Record<EmailLocale, EmailStrings> = {
  en,
  "zh-CN": zhCN,
  "zh-TW": zhTW,
  es,
  fr,
};

/**
 * Get email strings for a given locale. Falls back to English.
 */
export function getEmailStrings(locale?: string | null): EmailStrings {
  if (locale && locale in allEmailMessages) {
    return allEmailMessages[locale as EmailLocale];
  }
  return en;
}

/**
 * Look up a user's language preference by email address.
 * Returns the locale string or "en" as default.
 */
export async function getUserLanguage(email: string): Promise<EmailLocale> {
  try {
    const { prisma } = await import("./db");
    const user = await prisma.user.findUnique({
      where: { email },
      select: { language: true },
    });
    if (user?.language && user.language in allEmailMessages) {
      return user.language as EmailLocale;
    }
  } catch {
    // DB not available or user not found
  }
  return "en";
}
