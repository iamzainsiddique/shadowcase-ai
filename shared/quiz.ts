// "1-minute scam check": a quick before/after self-check. Two sets of 5 different messages, so the
// "after" check isn't just remembering answers. It's a rough self-check, not a scientific measure.
// All senders, links and amounts are fictional.

export interface QuizItem {
  id: string;
  from: string;
  text: string;
  isScam: boolean;
  why: string;
}

export const QUIZ_BEFORE: QuizItem[] = [
  { id: "a1", from: "TAX OFFICE", text: "You are due a tax refund of £326.40. Claim within 24 hours: taxrefund-claim-uk.info", isScam: true, why: "Tax offices don't text refund links, and the 24-hour deadline is there to rush you." },
  { id: "a2", from: "Riverside GP Surgery", text: "Reminder: your appointment is on Tuesday at 10:20 with Dr Shah. To cancel, please call the surgery.", isScam: false, why: "No link, no money, no pressure, and it tells you to use the surgery's normal number." },
  { id: "a3", from: "Unknown number", text: "Hi Mum, I dropped my phone, this is my new number. Can you help me pay a bill today? I'll explain later x", isScam: true, why: "A 'new number' plus an urgent money request is a well-known scam. Call your child on their old number to check." },
  { id: "a4", from: "Phone call", text: "This is the police. Your card has been used for fraud. Withdraw cash and hand it to our courier as evidence.", isScam: true, why: "Police never ask you to withdraw cash or hand money to a courier." },
  { id: "a5", from: "Northbridge Bank app", text: "You paid £23.10 to GreenLeaf Grocers. Not you? Open the app or call the number on your card.", isScam: false, why: "It doesn't ask for anything and sends you to your own app or the number on your card." },
];

export const QUIZ_AFTER: QuizItem[] = [
  { id: "b1", from: "ViewNest", text: "Your account is suspended. Update your payment details now: viewnest-billing-help.com", isScam: true, why: "A lookalike link and a scary 'suspended' message. Log in through the app you already use instead." },
  { id: "b2", from: "Your energy supplier", text: "Your new bill is ready. Log in to your account through our app to view it.", isScam: false, why: "No link, no pressure. It tells you to use the app you already have." },
  { id: "b3", from: "Prize Team", text: "Congratulations! You've won a £500 supermarket voucher. Just pay £2.99 postage to claim it.", isScam: true, why: "You can't win a prize you didn't enter. The small fee is to get your card details." },
  { id: "b4", from: "Phone call", text: "Bank fraud team here. To protect your money, we need you to move it to a new safe account today.", isScam: true, why: "No real bank will ever ask you to move money to a 'safe account'." },
  { id: "b5", from: "Hillcrest Pharmacy", text: "Your prescription is ready to collect from the pharmacy.", isScam: false, why: "It asks for nothing at all." },
];

export interface QuizResult {
  correct: number;
  total: number;
  at: string;
}
