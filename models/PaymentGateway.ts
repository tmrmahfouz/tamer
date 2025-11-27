import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IPaymentGateway extends Document {
  name: string
  type: 'vodafone_cash' | 'instapay' | 'fawry' | 'bank_transfer' | 'wallet'
  isActive: boolean
  config: {
    accountNumber?: string
    accountName?: string
    bankName?: string
    iban?: string
    merchantCode?: string
    apiKey?: string
    secretKey?: string
    instructions?: string
  }
  fees: {
    type: 'percentage' | 'fixed'
    value: number
  }
  minAmount?: number
  maxAmount?: number
  createdAt: Date
  updatedAt: Date
}

const PaymentGatewaySchema = new Schema<IPaymentGateway>(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['vodafone_cash', 'instapay', 'fawry', 'bank_transfer', 'wallet'],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    config: {
      accountNumber: String,
      accountName: String,
      bankName: String,
      iban: String,
      merchantCode: String,
      apiKey: String,
      secretKey: String,
      instructions: String,
    },
    fees: {
      type: {
        type: String,
        enum: ['percentage', 'fixed'],
        default: 'percentage',
      },
      value: {
        type: Number,
        default: 0,
      },
    },
    minAmount: Number,
    maxAmount: Number,
  },
  {
    timestamps: true,
  }
)

const PaymentGateway: Model<IPaymentGateway> =
  mongoose.models.PaymentGateway || mongoose.model<IPaymentGateway>('PaymentGateway', PaymentGatewaySchema)

export default PaymentGateway
