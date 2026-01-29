import { BaseController } from './BaseController.js';
import { TransactionService } from '../services/TransactionService.js';
import { createTransactionSchema, getTransactionsSchema } from '../schemas/transactionSchema.js';
import { AppError } from '../utils/AppError.js';

export class TransactionController extends BaseController {
    constructor() {
        super();
        this.transactionService = new TransactionService();
    }

    create = async (req, res, next) => {
        try {
            const validation = createTransactionSchema.safeParse(req.body);

            if (!validation.success) {
                throw new AppError(`Validation Error: ${validation.error.message}`, 400);
            }

            const result = await this.transactionService.createTransaction(validation.data);
            this.handleSuccess(res, result, 201);
        } catch (error) {
            next(error);
        }
    };

    list = async (req, res, next) => {
        try {
            const validation = getTransactionsSchema.safeParse(req.query);

            if (!validation.success) {
                throw new AppError(`Validation Error: ${validation.error.message}`, 400);
            }

            const { limit, offset, ...filters } = validation.data;
            const result = await this.transactionService.getTransactions(filters, { limit, offset });
            this.handleSuccess(res, result);
        } catch (error) {
            next(error);
        }
    };

    getById = async (req, res, next) => {
        try {
            const { id } = req.params;
            const result = await this.transactionService.getTransactionById(id);
            this.handleSuccess(res, result);
        } catch (error) {
            next(error);
        }
    };
}
