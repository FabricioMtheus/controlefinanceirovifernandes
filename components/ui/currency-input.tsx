"use client"

import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { formatCurrencyInput, getCurrencyValue } from '@/lib/currency-formatter'

interface CurrencyInputProps {
  value?: number
  onChange?: (value: number) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  id?: string
  name?: string
}

export function CurrencyInput({
  value = 0,
  onChange,
  placeholder = "R$ 0,00",
  disabled = false,
  className = "",
  id,
  name
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState('')

  useEffect(() => {
    if (value > 0) {
      setDisplayValue(formatCurrencyInput((value * 100).toString()))
    } else {
      setDisplayValue('')
    }
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const formatted = formatCurrencyInput(inputValue)
    setDisplayValue(formatted)
    
    const numericValue = getCurrencyValue(formatted)
    onChange?.(numericValue)
  }

  return (
    <Input
      id={id}
      name={name}
      type="text"
      value={displayValue}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
    />
  )
}
