import { useState, useEffect } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiRequest } from "@/lib/queryClient"
import { useToast } from "@/hooks/use-toast"

export function useBilling(userId, sessionId) {
  const [totalAmount, setTotalAmount] = useState(0)
  const [localItems, setLocalItems] = useState([])
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const isGuest = !(userId && sessionId)

  const { data: billItems = [], isLoading } = useQuery({
    queryKey: ["/api/bill-items", userId, sessionId],
    enabled: !!(userId && sessionId),
  })

  const addItemMutation = useMutation({
    mutationFn: async (item) => {
      const amount = parseFloat(item.quantity.split(" ")[0]) * item.rate

      const response = await apiRequest("POST", "/api/bill-items", {
        userId,
        sessionId,
        name: item.name,
        quantity: item.quantity,
        rate: item.rate,
        amount,
      })

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bill-items", userId, sessionId] })
      toast({
        title: "Item Added",
        description: "Item successfully added to bill",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add item to bill",
        variant: "destructive",
      })
    },
  })

  const removeItemMutation = useMutation({
    mutationFn: async (itemId) => {
      await apiRequest("DELETE", `/api/bill-items/${itemId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bill-items", userId, sessionId] })
      toast({
        title: "Item Removed",
        description: "Item successfully removed from bill",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove item from bill",
        variant: "destructive",
      })
    },
  })

  const clearBillMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/bill-items/${userId}/${sessionId}/clear`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bill-items", userId, sessionId] })
      toast({
        title: "Bill Cleared",
        description: "All items removed from bill",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to clear bill",
        variant: "destructive",
      })
    },
  })

  const updateBillMutation = useMutation({
    mutationFn: async (customerPhone) => {
      const response = await apiRequest("POST", "/api/bill", {
        userId,
        sessionId,
        customerPhone: customerPhone || null,
        totalAmount,
        status: "active",
      })

      return response.json()
    },
    onSuccess: () => {
      toast({
        title: "Bill Updated",
        description: "Bill information updated successfully",
      })
    },
  })

  // Calculate total amount whenever items change
  useEffect(() => {
    const items = isGuest ? localItems : billItems
    const total = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
    setTotalAmount(total)
  }, [billItems, localItems, isGuest])

  const addItem = async (name, quantity, rate) => {
    if (isGuest) {
      const qtyNum = parseFloat(String(quantity).split(" ")[0]) || 1
      const amount = qtyNum * Number(rate)
      const newItem = {
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        name,
        quantity,
        rate: Number(rate),
        amount,
      }
      setLocalItems((prev) => [...prev, newItem])
      toast({ title: "Item Added", description: "Item added to bill (guest)" })
      return
    }
    await addItemMutation.mutateAsync({ name, quantity, rate })
  }

  const removeItem = async (id, name) => {
    if (isGuest) {
      setLocalItems((prev) => {
        let next = prev
        if (name && !id) {
          const idx = prev.findIndex((it) => it.name.toLowerCase().includes(name.toLowerCase()))
          if (idx !== -1) {
            next = [...prev.slice(0, idx), ...prev.slice(idx + 1)]
          } else {
            toast({ title: "Item Not Found", description: `${name} not found in bill`, variant: "destructive" })
          }
        } else if (id) {
          next = prev.filter((it) => it.id !== id)
        }
        return next
      })
      return
    }
    if (name && !id) {
      const item = billItems.find((item) =>
        item.name.toLowerCase().includes(name.toLowerCase())
      )
      if (item) {
        await removeItemMutation.mutateAsync(item.id)
      } else {
        toast({
          title: "Item Not Found",
          description: `${name} not found in bill`,
          variant: "destructive",
        })
      }
    } else {
      await removeItemMutation.mutateAsync(id)
    }
  }

  const clearBill = async () => {
    if (isGuest) {
      setLocalItems([])
      toast({ title: "Bill Cleared", description: "All items removed (guest)" })
      return
    }
    await clearBillMutation.mutateAsync()
  }

  const updateBill = async (customerPhone) => {
    if (isGuest) {
      toast({ title: "Guest Mode", description: "Bill update skipped in guest mode" })
      return
    }
    await updateBillMutation.mutateAsync(customerPhone)
  }

  return {
    billItems: isGuest ? localItems : billItems,
    totalAmount,
    isLoading: isGuest ? false : isLoading,
    addItem,
    removeItem,
    clearBill,
    updateBill,
  }
}
