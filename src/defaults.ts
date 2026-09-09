import type {
  SubscribeFormBrand,
  SubscribeFormConfig,
  SubscribeFormDefaultTexts,
} from './types'

export function genericConsentCopy(brand: SubscribeFormBrand): SubscribeFormDefaultTexts {
  const { name, legalEntity } = brand
  return {
    cbSms: `I agree to receive recurring informational text messages from ${name}, operated by ${legalEntity}. Message frequency varies. Message and data rates may apply. Reply STOP to opt out or HELP for help.`,
    cbMarketing: `By checking this box, I provide my express written consent to receive recurring automated marketing and promotional text messages from ${name}, operated by ${legalEntity}, at the phone number provided. Message frequency varies. Message and data rates may apply. Reply STOP to opt out or HELP for help. Consent is not required as a condition of purchasing any goods or services.`,
    cbEmail: `I agree to receive recurring emails from ${name}, operated by ${legalEntity}. Email frequency varies. I can unsubscribe at any time.`,
    cbTerms: 'I agree to the Terms of Service and acknowledge the Privacy Policy. *',
  }
}

export function buildDefaultSubscribeFormConfig(
  brand: SubscribeFormBrand,
  extraTexts?: SubscribeFormDefaultTexts,
): SubscribeFormConfig {
  const texts = { ...genericConsentCopy(brand), ...extraTexts }
  return {
    firstName: { visible: true, required: true, text: texts.firstName || 'First name' },
    lastName: { visible: true, required: true, text: texts.lastName || 'Last name' },
    email: { visible: true, required: false, text: texts.email || 'Email (opt.)' },
    phone: { visible: true, required: false, text: texts.phone || 'Phone (opt.)' },
    cbEmail: {
      visible: true,
      required: false,
      text: texts.cbEmail || genericConsentCopy(brand).cbEmail!,
    },
    cbSms: {
      visible: true,
      required: false,
      text: texts.cbSms || genericConsentCopy(brand).cbSms!,
    },
    cbMarketing: {
      visible: true,
      required: false,
      text: texts.cbMarketing || genericConsentCopy(brand).cbMarketing!,
    },
    cbTerms: {
      visible: true,
      required: true,
      text: texts.cbTerms || 'I agree to the Terms of Service and acknowledge the Privacy Policy.',
    },
  }
}
