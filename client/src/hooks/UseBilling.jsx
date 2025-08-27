import { useState, useEffect } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiRequest } from "@/lib/queryClient"
import { useToast } from "@/hooks/use-toast"

export function useBilling(userId, sessionId) {
  const [totalAmount, setTotalAmount] = useState(0)
  const { toast } = useToast()
  const queryClient = useQueryClient()

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

  // Calculate total amount whenever bill items change
  useEffect(() => {
    const total = billItems.reduce((sum, item) => sum + item.amount, 0)
    setTotalAmount(total)
  }, [billItems])

  const addItem = async (name, quantity, rate) => {
    await addItemMutation.mutateAsync({ name, quantity, rate })
  }

  const removeItem = async (id, name) => {
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
    await clearBillMutation.mutateAsync()
  }

  const updateBill = async (customerPhone) => {
    await updateBillMutation.mutateAsync(customerPhone)
  }

  return {
    billItems,
    totalAmount,
    isLoading,
    addItem,
    removeItem,
    clearBill,
    updateBill,
  }
}
