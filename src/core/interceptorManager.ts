import { ResolvedFn, RejectedFn } from '../types'

interface Interceptor<T> {
  resolved: ResolvedFn<T>
  rejected?: RejectedFn
}

export default class InterceptorManager<T> {
  private interceptors: Array<Interceptor<T> | null> // 存储拦截器
  constructor() {
    this.interceptors = []
  }

  forEach(fn: (Interceptor: Interceptor<T>) => void): void {
    this.interceptors.forEach(interceptor => {
      if (interceptor !== null) {
        fn(interceptor)
      }
    })
  }

  use(resolved: ResolvedFn<T>, rejected?: RejectedFn): number {
    this.interceptors.push({
      resolved,
      rejected
    })
    return this.interceptors.length - 1 // 返回的id实际上是拦截器的长度
  }

  eject(id: number): void {
    if (this.interceptors[id]) {
      this.interceptors[id] = null // 不能直接将数据中的拦截器删除,因为每个拦截器id实际上是数组长度,如果直接删除数组中的某一项,那么其余拦截器的id会混乱
    }
  }
}
