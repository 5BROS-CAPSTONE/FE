import type { RouteObject } from 'react-router-dom'
import AreaPage from './AreaPage'
import TicketPage from './TicketPage'

export const operationsRoutes: RouteObject[] = [
  { path: 'khu-vuc-canh-tac', element: <AreaPage /> },
  { path: 'quan-ly-phieu', element: <TicketPage /> },
]
