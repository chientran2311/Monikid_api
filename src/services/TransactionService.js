import TransactionRepository from '../repositories/TransactionRepository.js';

export class TransactionService {
    constructor() {
        this.transactionRepository = TransactionRepository;
    }

    async createTransaction(data) {
        // Just pass through for now, logic can be added here (e.g. check balance)
        // Note: To check balance, we'd need WalletRepository.
        return await this.transactionRepository.create(data);
    }

    async getTransactions(filters, pagination) {
        return await this.transactionRepository.find(filters, pagination);
    }

    async getTransactionById(id) {
        return await this.transactionRepository.findById(id);
    }
}
