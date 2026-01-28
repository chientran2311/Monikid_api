import crypto from 'crypto';
import { Errors } from '../utils/errors.js';

// =============================================================================
// TYPES
// =============================================================================

interface BankAccount {
    id: string;
    accountNumber: string;
    phone: string;
    fullName: string;
    balance: number;
    isActive: boolean;
    createdAt: Date;
}

interface Transaction {
    id: string;
    accountNumber: string;
    type: 'DEPOSIT' | 'WITHDRAW' | 'TRANSFER_OUT' | 'TRANSFER_IN';
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    description: string;
    reference?: string;
    createdAt: Date;
}

// =============================================================================
// IN-MEMORY STORES (for demo - use database in production)
// =============================================================================

const accountStore = new Map<string, BankAccount>();
const transactionStore = new Map<string, Transaction[]>();

// Seed some demo accounts
function seedDemoData() {
    const demoAccounts: Omit<BankAccount, 'id' | 'createdAt'>[] = [
        { accountNumber: '100000000001', phone: '0901234567', fullName: 'Nguyễn Văn A', balance: 50000000, isActive: true },
        { accountNumber: '100000000002', phone: '0909876543', fullName: 'Trần Thị B', balance: 25000000, isActive: true },
    ];

    for (const acc of demoAccounts) {
        const account: BankAccount = {
            id: crypto.randomUUID(),
            ...acc,
            createdAt: new Date(),
        };
        accountStore.set(acc.accountNumber, account);
        transactionStore.set(acc.accountNumber, []);
    }
    console.log('🌱 Seeded demo accounts');
}

seedDemoData();

// =============================================================================
// SERVICE
// =============================================================================

class BankService {
    /**
     * Create new bank account
     */
    createAccount(phone: string, fullName: string, initialBalance: number = 10000000): BankAccount {
        const accountNumber = this.generateAccountNumber();

        const account: BankAccount = {
            id: crypto.randomUUID(),
            accountNumber,
            phone: this.normalizePhone(phone),
            fullName,
            balance: initialBalance,
            isActive: true,
            createdAt: new Date(),
        };

        accountStore.set(accountNumber, account);
        transactionStore.set(accountNumber, []);

        // Record initial deposit
        if (initialBalance > 0) {
            this.recordTransaction(accountNumber, {
                type: 'DEPOSIT',
                amount: initialBalance,
                balanceBefore: 0,
                balanceAfter: initialBalance,
                description: 'Nạp tiền mở tài khoản',
            });
        }

        console.log(`🏦 Created account ${accountNumber} for ${phone}`);
        return account;
    }

    /**
     * Get account by account number
     */
    getAccount(accountNumber: string): BankAccount | null {
        return accountStore.get(accountNumber) || null;
    }

    /**
     * Get accounts by phone number
     */
    getAccountsByPhone(phone: string): BankAccount[] {
        const normalizedPhone = this.normalizePhone(phone);
        const accounts: BankAccount[] = [];

        for (const account of accountStore.values()) {
            if (account.phone === normalizedPhone) {
                accounts.push(account);
            }
        }

        return accounts;
    }

    /**
     * Deposit money (Nạp tiền)
     */
    deposit(accountNumber: string, amount: number, description?: string): Transaction {
        const account = this.getAccount(accountNumber);
        if (!account) {
            throw Errors.ACCOUNT_NOT_FOUND();
        }

        if (amount <= 0) {
            throw Errors.INVALID_AMOUNT();
        }

        const balanceBefore = account.balance;
        account.balance += amount;

        const transaction = this.recordTransaction(accountNumber, {
            type: 'DEPOSIT',
            amount,
            balanceBefore,
            balanceAfter: account.balance,
            description: description || 'Nạp tiền vào tài khoản',
        });

        console.log(`💵 Deposited ${amount} to ${accountNumber}`);
        return transaction;
    }

    /**
     * Withdraw money (Rút tiền)
     */
    withdraw(accountNumber: string, amount: number, description?: string): Transaction {
        const account = this.getAccount(accountNumber);
        if (!account) {
            throw Errors.ACCOUNT_NOT_FOUND();
        }

        if (amount <= 0) {
            throw Errors.INVALID_AMOUNT();
        }

        if (account.balance < amount) {
            throw Errors.INSUFFICIENT_BALANCE();
        }

        const balanceBefore = account.balance;
        account.balance -= amount;

        const transaction = this.recordTransaction(accountNumber, {
            type: 'WITHDRAW',
            amount,
            balanceBefore,
            balanceAfter: account.balance,
            description: description || 'Rút tiền từ tài khoản',
        });

        console.log(`💸 Withdrew ${amount} from ${accountNumber}`);
        return transaction;
    }

    /**
     * Transfer to MoniKid wallet (Chuyển tiền sang ví)
     */
    transferToWallet(accountNumber: string, walletId: string, amount: number, description?: string): Transaction {
        const account = this.getAccount(accountNumber);
        if (!account) {
            throw Errors.ACCOUNT_NOT_FOUND();
        }

        if (amount <= 0) {
            throw Errors.INVALID_AMOUNT();
        }

        if (account.balance < amount) {
            throw Errors.INSUFFICIENT_BALANCE();
        }

        const balanceBefore = account.balance;
        account.balance -= amount;

        const transaction = this.recordTransaction(accountNumber, {
            type: 'TRANSFER_OUT',
            amount,
            balanceBefore,
            balanceAfter: account.balance,
            description: description || `Chuyển tiền đến ví ${walletId.slice(0, 8)}...`,
            reference: walletId,
        });

        console.log(`📤 Transferred ${amount} from ${accountNumber} to wallet ${walletId}`);
        return transaction;
    }

    /**
     * Receive from MoniKid wallet (Nhận tiền từ ví)
     */
    receiveFromWallet(accountNumber: string, walletId: string, amount: number, description?: string): Transaction {
        const account = this.getAccount(accountNumber);
        if (!account) {
            throw Errors.ACCOUNT_NOT_FOUND();
        }

        if (amount <= 0) {
            throw Errors.INVALID_AMOUNT();
        }

        const balanceBefore = account.balance;
        account.balance += amount;

        const transaction = this.recordTransaction(accountNumber, {
            type: 'TRANSFER_IN',
            amount,
            balanceBefore,
            balanceAfter: account.balance,
            description: description || `Nhận tiền từ ví ${walletId.slice(0, 8)}...`,
            reference: walletId,
        });

        console.log(`📥 Received ${amount} to ${accountNumber} from wallet ${walletId}`);
        return transaction;
    }

    /**
     * Get transaction history
     */
    getTransactions(accountNumber: string, limit: number = 20): Transaction[] {
        const transactions = transactionStore.get(accountNumber) || [];
        return transactions.slice(-limit).reverse();
    }

    // ===========================================================================
    // PRIVATE METHODS
    // ===========================================================================

    private normalizePhone(phone: string): string {
        if (phone.startsWith('+84')) {
            return '0' + phone.slice(3);
        }
        return phone;
    }

    private generateAccountNumber(): string {
        // 12-digit account number starting with 1
        const randomPart = Math.floor(Math.random() * 99999999999).toString().padStart(11, '0');
        return '1' + randomPart;
    }

    private recordTransaction(
        accountNumber: string,
        data: Omit<Transaction, 'id' | 'accountNumber' | 'createdAt'>
    ): Transaction {
        const transaction: Transaction = {
            id: crypto.randomUUID(),
            accountNumber,
            ...data,
            createdAt: new Date(),
        };

        const transactions = transactionStore.get(accountNumber) || [];
        transactions.push(transaction);
        transactionStore.set(accountNumber, transactions);

        return transaction;
    }
}

export const bankService = new BankService();
