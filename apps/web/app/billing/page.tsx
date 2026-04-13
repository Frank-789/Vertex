'use client'

import { useState } from 'react'
import { Check, CreditCard, Zap, Crown, ArrowUpRight } from 'lucide-react'

export default function BillingPage() {
  const [selectedPlan, setSelectedPlan] = useState('pro')
  const [paymentMethod, setPaymentMethod] = useState('visa')

  const plans = [
    {
      id: 'free',
      name: '免费版',
      price: '¥0',
      period: '/月',
      description: '适合个人用户和小团队',
      features: [
        '基础聊天功能',
        '每月100次API调用',
        '基础文件分析',
        '社区支持',
        '1GB存储空间',
      ],
      limitations: [
        '不支持团队协作',
        '无优先支持',
        '有限的分析功能',
      ],
      buttonText: '当前计划',
      buttonVariant: 'secondary' as const,
    },
    {
      id: 'pro',
      name: '专业版',
      price: '¥299',
      period: '/月',
      description: '适合专业分析师和中小团队',
      features: [
        '全部聊天功能',
        '无限API调用',
        '高级文件分析',
        '优先支持',
        '10GB存储空间',
        '团队协作（最多5人）',
        '高级数据可视化',
      ],
      buttonText: '升级到专业版',
      buttonVariant: 'primary' as const,
      popular: true,
    },
    {
      id: 'enterprise',
      name: '企业版',
      price: '定制',
      period: '',
      description: '适合大型企业和组织',
      features: [
        '所有专业版功能',
        '专属客户经理',
        '定制AI模型',
        '无限存储空间',
        'SLA保证',
        '私有化部署',
        '专属培训和支持',
      ],
      buttonText: '联系我们',
      buttonVariant: 'secondary' as const,
    },
  ]

  const paymentMethods = [
    { id: 'visa', name: 'Visa', last4: '4242', expiry: '12/26' },
    { id: 'mastercard', name: 'MasterCard', last4: '8888', expiry: '09/25' },
    { id: 'alipay', name: '支付宝', last4: '关联账户', expiry: '-' },
  ]

  const invoices = [
    { id: 'INV-2024-001', date: '2024-03-15', amount: '¥299.00', status: '已支付' },
    { id: 'INV-2024-002', date: '2024-02-15', amount: '¥299.00', status: '已支付' },
    { id: 'INV-2024-003', date: '2024-01-15', amount: '¥299.00', status: '已支付' },
    { id: 'INV-2023-012', date: '2023-12-15', amount: '¥299.00', status: '已支付' },
  ]

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">订阅管理</h1>
        <p className="text-text-muted">
          管理您的订阅计划、支付方式和账单
        </p>
      </div>

      {/* 当前订阅状态 */}
      <div className="glass rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold mb-1">当前订阅</h3>
            <p className="text-text-muted">您当前使用的是专业版计划</p>
          </div>
          <div className="px-4 py-2 rounded-full bg-primary/20 text-primary-light text-sm font-medium">
            活跃中
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-secondary/30 rounded-xl p-4">
            <p className="text-xs text-text-muted mb-1">下次扣款日期</p>
            <p className="text-2xl font-bold">2024-04-15</p>
          </div>
          <div className="bg-secondary/30 rounded-xl p-4">
            <p className="text-xs text-text-muted mb-1">月费用</p>
            <p className="text-2xl font-bold">¥299.00</p>
          </div>
          <div className="bg-secondary/30 rounded-xl p-4">
            <p className="text-xs text-text-muted mb-1">剩余API调用</p>
            <p className="text-2xl font-bold">∞ 无限</p>
          </div>
        </div>

        <button className="px-6 py-3 rounded-xl border border-border text-sm font-medium hover:bg-secondary/50 transition">
          取消订阅
        </button>
      </div>

      {/* 选择计划 */}
      <div className="glass rounded-2xl p-6 mb-6">
        <h3 className="text-lg font-semibold mb-6">选择计划</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-2xl border-2 p-6 ${selectedPlan === plan.id ? 'border-primary-light bg-primary/10' : 'border-border bg-secondary/30'} ${plan.popular ? 'relative' : ''}`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="px-4 py-1 rounded-full bg-gradient-to-r from-primary to-primary-light text-white text-xs font-medium flex items-center gap-1">
                    <Zap size={12} />
                    最受欢迎
                  </div>
                </div>
              )}

              <div className="mb-4">
                <div className="flex items-baseline mb-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-text-muted ml-1">{plan.period}</span>
                </div>
                <h4 className="text-lg font-semibold mb-1">{plan.name}</h4>
                <p className="text-sm text-text-muted">{plan.description}</p>
              </div>

              <div className="space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Check size={16} className="text-accent" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
                {plan.limitations?.map((limitation, idx) => (
                  <div key={idx} className="flex items-center gap-2 opacity-50">
                    <div className="w-4 h-4"></div>
                    <span className="text-sm line-through">{limitation}</span>
                  </div>
                ))}
              </div>

              <button
                className={`w-full py-3 rounded-xl font-medium transition ${
                  plan.buttonVariant === 'primary'
                    ? 'bg-gradient-to-r from-primary to-primary-light text-white hover:opacity-90'
                    : 'bg-secondary text-foreground hover:bg-secondary/50'
                }`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 支付方式 */}
      <div className="glass rounded-2xl p-6 mb-6">
        <h3 className="text-lg font-semibold mb-6">支付方式</h3>
        <div className="space-y-4 mb-6">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition ${paymentMethod === method.id ? 'bg-primary/10 border border-primary-light' : 'bg-secondary/30 hover:bg-secondary/50'}`}
              onClick={() => setPaymentMethod(method.id)}
            >
              <div className="flex items-center gap-4">
                <CreditCard size={20} />
                <div>
                  <p className="font-medium">{method.name}</p>
                  <p className="text-sm text-text-muted">**** **** **** {method.last4} • 有效期 {method.expiry}</p>
                </div>
              </div>
              {paymentMethod === method.id && (
                <div className="w-5 h-5 rounded-full bg-primary-light flex items-center justify-center">
                  <Check size={12} className="text-white" />
                </div>
              )}
            </div>
          ))}
        </div>
        <button className="px-6 py-3 rounded-xl border border-border text-sm font-medium hover:bg-secondary/50 transition flex items-center gap-2">
          <ArrowUpRight size={16} />
          添加新的支付方式
        </button>
      </div>

      {/* 账单历史 */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-6">账单历史</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 text-sm font-medium text-text-muted">发票编号</th>
                <th className="text-left py-3 text-sm font-medium text-text-muted">日期</th>
                <th className="text-left py-3 text-sm font-medium text-text-muted">金额</th>
                <th className="text-left py-3 text-sm font-medium text-text-muted">状态</th>
                <th className="text-left py-3 text-sm font-medium text-text-muted">操作</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-border/30">
                  <td className="py-3">{invoice.id}</td>
                  <td className="py-3 text-text-muted">{invoice.date}</td>
                  <td className="py-3 font-medium">{invoice.amount}</td>
                  <td className="py-3">
                    <span className="px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-medium">
                      {invoice.status}
                    </span>
                  </td>
                  <td className="py-3">
                    <button className="text-primary-light hover:underline text-sm">
                      下载发票
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}