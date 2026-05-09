'use client'

import { useApp } from '@/components/AppProvider'
import { AppointmentModal } from '@/components/appointments/AppointmentModal'
import { AppointmentDetail } from '@/components/appointments/AppointmentDetail'
import { DogModal } from '@/components/dogs/DogModal'
import { DogDetail } from '@/components/dogs/DogDetail'
import { BusinessExpenseModal } from '@/components/finances/BusinessExpenseModal'
import { HomeExpenseModal } from '@/components/finances/HomeExpenseModal'
import { ConfirmModal } from '@/components/ui/ConfirmModal'

export function ModalManager() {
  const { modal, setModal } = useApp()
  const close = () => setModal(null)

  if (!modal) return null

  return (
    <>
      {modal.type === 'appointment'     && <AppointmentModal appointment={modal.data} onClose={close} />}
      {modal.type === 'aptDetail'       && <AppointmentDetail aptId={modal.data} onClose={close} />}
      {modal.type === 'dog'             && <DogModal dog={modal.data} onClose={close} />}
      {modal.type === 'dogDetail'       && <DogDetail dogId={modal.data} onClose={close} />}
      {modal.type === 'businessExpense' && <BusinessExpenseModal expense={modal.data} onClose={close} />}
      {modal.type === 'homeExpense'     && <HomeExpenseModal expense={modal.data} onClose={close} />}
      {modal.type === 'confirm'         && <ConfirmModal {...modal.data} onClose={close} />}
    </>
  )
}
