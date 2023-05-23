import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
import axios from 'axios';
import fs from 'fs';

const apiUrl = '';
const apiKey = ''; // Reemplaza con tu propia clave de API

const network = {
  chainId: 'mainnet', // Reemplaza con el ID de cadena correcto
};

// Función para generar una dirección criptográfica a partir de una clave privada
async function generateAddress(privateKey) {
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(privateKey);
  const [{ address }] = await wallet.getAccounts();
  return address;
}

// Función para obtener el saldo de una dirección en la red de Cosmos
async function getBalance(address) {
  const endpoint = `/*/mainnet/cosmos/bank/v1beta1/balances/${address}`;
  try {
    await sleep(2000); // Espera de 2 segundos
    const response = await axios.get(apiUrl + endpoint, {
      headers: {
        'x-api-key': apiKey,
      },
    });
    const balance = response.data.balances.find((b) => b.denom === 'uatom');
    return balance ? balance.amount.toFixed(6) : '0';
  } catch (error) {
    console.error('Error retrieving balance:', error);
    return '0';
  }
}

// Función para obtener las transacciones de una dirección en la red de Cosmos
async function getTransactions(address) {
  const endpoint = `/*/mainnet/cosmos/tx/v1beta1/txs?events=transfer.recipient%3D%27${address}%27`;
  try {
    await sleep(2000); // Espera de 2 segundos
    const response = await axios.get(apiUrl + endpoint, {
      headers: {
        'x-api-key': apiKey,
      },
    });

    return response.data.total_count;
  } catch (error) {
    console.error('Error retrieving transactions:', error);
    return 0;
  }
}

// Función para esperar un cierto número de milisegundos
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class Console {
  constructor(address, balance, transactions, privateKey) {
    this.address = address;
    this.balance = balance;
    this.transactions = transactions;
    this.privateKey = privateKey;
  }

  printDetails() {
    console.log('Address:', this.address);
    console.log('Balance:', this.balance, 'uatom');
    console.log('Total Transactions:', this.transactions);
    console.log('Mnemonic:', this.privateKey);
  }

  exportDetailsToFile(filename) {
    const content = `Address: ${this.address}
Balance: ${this.balance} uatom | Txs: ${this.transactions} |
----------------------------------------------------------------------------------
Mnemonic: ${this.privateKey}
----------------------------------------------------------------------------------`;

    try {
      if (fs.existsSync(filename)) {
        fs.appendFileSync(filename, '\n\n' + content);
      } else {
        fs.writeFileSync(filename, content);
      }
      console.log(`Details exported to ${filename}`);
    } catch (error) {
      console.error('Error writing to file:', error);
    }
  }
}

// Ejemplo de uso:
async function main() {
const privateKey = '';
const address = await generateAddress(privateKey);

const balance = await getBalance(address);
const transactions = await getTransactions(address);

const console = new Console(address, balance, transactions, privateKey);

console.printDetails();
console.exportDetailsToFile('cosmos_details.txt');
}

main();
