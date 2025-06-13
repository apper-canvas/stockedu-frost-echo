import requestData from '../mockData/requests.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class RequestService {
  constructor() {
    this.data = [...requestData];
  }

  async getAll() {
    await delay(300);
    return [...this.data];
  }

  async getById(id) {
    await delay(200);
    const request = this.data.find(request => request.id === id);
    return request ? { ...request } : null;
  }

  async create(request) {
    await delay(400);
    const newRequest = {
      ...request,
      id: Date.now().toString(),
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    this.data.push(newRequest);
    return { ...newRequest };
  }

  async update(id, updateData) {
    await delay(300);
    const index = this.data.findIndex(request => request.id === id);
    if (index === -1) {
      throw new Error('Request not found');
    }
    
    this.data[index] = {
      ...this.data[index],
      ...updateData
    };
    
    return { ...this.data[index] };
  }

  async delete(id) {
    await delay(250);
    const index = this.data.findIndex(request => request.id === id);
    if (index === -1) {
      throw new Error('Request not found');
    }
    
    const deletedRequest = this.data.splice(index, 1)[0];
    return { ...deletedRequest };
  }

  async updateStatus(id, status) {
    await delay(300);
    return this.update(id, { status });
  }

  async getPendingRequests() {
    await delay(200);
    return this.data
      .filter(request => request.status === 'pending')
      .map(request => ({ ...request }));
}

  async getNotifications() {
    await delay(200);
    const recentRequests = this.data
      .filter(request => request.status !== 'pending')
      .slice(0, 5)
      .map(request => ({
        id: `request-${request.id}`,
        type: 'request_status',
        title: `Request ${request.status}`,
        message: `${request.itemName} (${request.quantity} units)`,
        createdAt: request.createdAt,
        data: request
      }));
    
    return recentRequests;
  }

export default new RequestService();