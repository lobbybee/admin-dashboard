<template>
  <div class="flex flex-col gap-6">
    <!-- Tab menu for different payment sections -->
    <TabView v-model:activeIndex="activeTab">
      <TabPanel header="Subscription Plans">
        <div class="py-4">
          <SubscriptionPlanList
            :subscription-plans="subscriptionPlans?.results"
            :loading="isPlansLoading"
            :total-records="subscriptionPlans?.count"
            :page-size="plansPageSize"
            :search="plansSearchQuery"
            @page-changed="onPlansPageChange"
            @add-plan="showAddPlanForm"
            @edit-plan="showEditPlanForm"
            @delete-plan="showDeletePlanConfirm"
            @update:search="updatePlansSearch"
            @search="fetchSubscriptionPlans"
          />
        </div>
      </TabPanel>
      
      <TabPanel header="Transactions">
        <div class="py-4">
          <TransactionList
            :transactions="transactions?.results"
            :loading="isTransactionsLoading"
            :total-records="transactions?.count"
            :page-size="transactionsPageSize"
            :search="transactionsSearchQuery"
            @page-changed="onTransactionsPageChange"
            @add-transaction="showAddTransactionForm"
            @edit-transaction="showEditTransactionForm"
            @delete-transaction="showDeleteTransactionConfirm"
            @update:search="updateTransactionsSearch"
            @search="fetchTransactions"
          />
        </div>
      </TabPanel>
      
      <TabPanel header="Hotel Subscriptions">
        <div class="py-4">
          <HotelSubscriptionList
            :subscriptions="subscriptions?.results"
            :loading="isSubscriptionsLoading"
            :total-records="subscriptions?.count"
            :page-size="subscriptionsPageSize"
            :search="subscriptionsSearchQuery"
            @page-changed="onSubscriptionsPageChange"
            @add-subscription="showAddSubscriptionForm"
            @extend-subscription="showExtendSubscriptionForm"
            @edit-subscription="showEditSubscriptionForm"
            @delete-subscription="showDeleteSubscriptionConfirm"
            @update:search="updateSubscriptionsSearch"
            @search="fetchHotelSubscriptions"
          />
        </div>
      </TabPanel>
    </TabView>
    
    <!-- Dialogs -->
    <SubscriptionPlanForm
      :visible="planFormVisible"
      :plan="selectedPlan"
      :loading="isCreatingPlan || isUpdatingPlan"
      @update:visible="planFormVisible = $event"
      @save="handlePlanSave"
    />
    
    <TransactionForm
      :visible="transactionFormVisible"
      :transaction="selectedTransaction"
      :loading="isCreatingTransaction || isUpdatingTransaction"
      @update:visible="transactionFormVisible = $event"
      @save="handleTransactionSave"
    />
    
    <HotelSubscriptionForm
      :visible="subscriptionFormVisible"
      :subscription="selectedSubscription"
      :loading="isCreatingSubscription || isUpdatingSubscription"
      @update:visible="subscriptionFormVisible = $event"
      @save="handleSubscriptionSave"
    />
    
    <ConfirmDialog />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import ConfirmDialog from 'primevue/confirmdialog';
import SubscriptionPlanList from '~/components/Payments/SubscriptionPlanList.vue';
import SubscriptionPlanForm from '~/components/Payments/SubscriptionPlanForm.vue';
import TransactionList from '~/components/Payments/TransactionList.vue';
import TransactionForm from '~/components/Payments/TransactionForm.vue';
import HotelSubscriptionList from '~/components/Payments/HotelSubscriptionList.vue';
import HotelSubscriptionForm from '~/components/Payments/HotelSubscriptionForm.vue';
import { 
  useFetchSubscriptionPlans,
  useCreateSubscriptionPlan,
  useUpdateSubscriptionPlan,
  useDeleteSubscriptionPlan,
  useFetchTransactions,
  useCreateTransaction,
  useUpdateTransaction,
  useDeleteTransaction,
  useFetchHotelSubscriptions,
  useCreateHotelSubscription,
  useUpdateHotelSubscription,
  useDeleteHotelSubscription
} from '~/composables/usePayments';
import type { 
  SubscriptionPlan, 
  SubscriptionPlanCreateRequest, 
  SubscriptionPlanUpdateRequest,
  Transaction,
  TransactionCreateRequest,
  TransactionUpdateRequest,
  HotelSubscription,
  HotelSubscriptionCreateRequest,
  HotelSubscriptionUpdateRequest
} from '~/types/payments';

const toast = useToast();
const confirm = useConfirm();
const activeTab = ref(0);

// Subscription Plans
const plansCurrentPage = ref(1);
const plansPageSize = ref(10);
const plansSearchQuery = ref('');

const planFormVisible = ref(false);
const selectedPlan = ref<SubscriptionPlan | null>(null);

const { data: subscriptionPlans, isLoading: isPlansLoading, refetch: refetchPlans } = useFetchSubscriptionPlans();

const { createSubscriptionPlan, isLoading: isCreatingPlan } = useCreateSubscriptionPlan();
const { updateSubscriptionPlan, isLoading: isUpdatingPlan } = useUpdateSubscriptionPlan();
const { deleteSubscriptionPlan, isLoading: isDeletingPlan } = useDeleteSubscriptionPlan();

// Transactions
const transactionsCurrentPage = ref(1);
const transactionsPageSize = ref(10);
const transactionsSearchQuery = ref('');

const transactionFormVisible = ref(false);
const selectedTransaction = ref<Transaction | null>(null);

const { data: transactions, isLoading: isTransactionsLoading, refetch: refetchTransactions } = useFetchTransactions();

const { createTransaction, isLoading: isCreatingTransaction } = useCreateTransaction();
const { updateTransaction, isLoading: isUpdatingTransaction } = useUpdateTransaction();
const { deleteTransaction, isLoading: isDeletingTransaction } = useDeleteTransaction();

// Hotel Subscriptions
const subscriptionsCurrentPage = ref(1);
const subscriptionsPageSize = ref(10);
const subscriptionsSearchQuery = ref('');

const subscriptionFormVisible = ref(false);
const selectedSubscription = ref<HotelSubscription | null>(null);

const { data: subscriptions, isLoading: isSubscriptionsLoading, refetch: refetchSubscriptions } = useFetchHotelSubscriptions();

const { createHotelSubscription, isLoading: isCreatingSubscription } = useCreateHotelSubscription();
const { updateHotelSubscription, isLoading: isUpdatingSubscription } = useUpdateHotelSubscription();
const { deleteHotelSubscription, isLoading: isDeletingSubscription } = useDeleteHotelSubscription();

// Subscription Plans handlers
const onPlansPageChange = (event: any) => {
  plansCurrentPage.value = event.page + 1;
  plansPageSize.value = event.rows;
  fetchSubscriptionPlans();
};

const updatePlansSearch = (value: string) => {
  plansSearchQuery.value = value;
};

const fetchSubscriptionPlans = () => {
  refetchPlans();
};

const showAddPlanForm = () => {
  selectedPlan.value = null;
  planFormVisible.value = true;
};

const showEditPlanForm = (plan: SubscriptionPlan) => {
  selectedPlan.value = plan;
  planFormVisible.value = true;
};

const showDeletePlanConfirm = (plan: SubscriptionPlan) => {
  confirm.require({
    message: `Are you sure you want to delete the subscription plan "${plan.name}"?`,
    header: 'Delete Confirmation',
    icon: 'pi pi-exclamation-triangle',
    accept: () => handleDeletePlan(plan.id),
    reject: () => {}
  });
};

const handlePlanSave = async (
  data: SubscriptionPlanCreateRequest | SubscriptionPlanUpdateRequest,
  isEdit: boolean,
  id?: string
) => {
  try {
    if (isEdit && id) {
      await updateSubscriptionPlan({ id, data: data as SubscriptionPlanUpdateRequest });
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Subscription plan updated successfully',
        life: 3000
      });
    } else {
      await createSubscriptionPlan(data as SubscriptionPlanCreateRequest);
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Subscription plan created successfully',
        life: 3000
      });
    }
    
    planFormVisible.value = false;
    fetchSubscriptionPlans();
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Operation failed',
      life: 5000
    });
  }
};

const handleDeletePlan = async (id: string) => {
  try {
    await deleteSubscriptionPlan(id);
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Subscription plan deleted successfully',
      life: 3000
    });
    fetchSubscriptionPlans();
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Delete failed',
      life: 5000
    });
  }
};

// Transactions handlers
const onTransactionsPageChange = (event: any) => {
  transactionsCurrentPage.value = event.page + 1;
  transactionsPageSize.value = event.rows;
  fetchTransactions();
};

const updateTransactionsSearch = (value: string) => {
  transactionsSearchQuery.value = value;
};

const fetchTransactions = () => {
  refetchTransactions();
};

const showAddTransactionForm = () => {
  selectedTransaction.value = null;
  transactionFormVisible.value = true;
};

const showEditTransactionForm = (transaction: Transaction) => {
  selectedTransaction.value = transaction;
  transactionFormVisible.value = true;
};

const showDeleteTransactionConfirm = (transaction: Transaction) => {
  confirm.require({
    message: `Are you sure you want to delete this transaction?`,
    header: 'Delete Confirmation',
    icon: 'pi pi-exclamation-triangle',
    accept: () => handleDeleteTransaction(transaction.id),
    reject: () => {}
  });
};

const handleTransactionSave = async (
  data: TransactionCreateRequest | TransactionUpdateRequest,
  isEdit: boolean,
  id?: string
) => {
  try {
    if (isEdit && id) {
      await updateTransaction({ id, data: data as TransactionUpdateRequest });
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Transaction updated successfully',
        life: 3000
      });
    } else {
      await createTransaction(data as TransactionCreateRequest);
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Transaction created successfully',
        life: 3000
      });
    }
    
    transactionFormVisible.value = false;
    fetchTransactions();
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Operation failed',
      life: 5000
    });
  }
};

const handleDeleteTransaction = async (id: string) => {
  try {
    await deleteTransaction(id);
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Transaction deleted successfully',
      life: 3000
    });
    fetchTransactions();
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Delete failed',
      life: 5000
    });
  }
};

// Hotel Subscriptions handlers
const onSubscriptionsPageChange = (event: any) => {
  subscriptionsCurrentPage.value = event.page + 1;
  subscriptionsPageSize.value = event.rows;
  fetchHotelSubscriptions();
};

const updateSubscriptionsSearch = (value: string) => {
  subscriptionsSearchQuery.value = value;
};

const fetchHotelSubscriptions = () => {
  refetchSubscriptions();
};

const showAddSubscriptionForm = () => {
  selectedSubscription.value = null;
  subscriptionFormVisible.value = true;
};

const showExtendSubscriptionForm = () => {
  // For now, we'll just show a toast message
  toast.add({
    severity: 'info',
    summary: 'Info',
    detail: 'Subscription extension functionality will be implemented in a future update',
    life: 3000
  });
};

const showEditSubscriptionForm = (subscription: HotelSubscription) => {
  selectedSubscription.value = subscription;
  subscriptionFormVisible.value = true;
};

const showDeleteSubscriptionConfirm = (subscription: HotelSubscription) => {
  confirm.require({
    message: `Are you sure you want to delete this hotel subscription?`,
    header: 'Delete Confirmation',
    icon: 'pi pi-exclamation-triangle',
    accept: () => handleDeleteSubscription(subscription.id),
    reject: () => {}
  });
};

const handleSubscriptionSave = async (
  data: HotelSubscriptionCreateRequest | HotelSubscriptionUpdateRequest,
  isEdit: boolean,
  id?: string
) => {
  try {
    if (isEdit && id) {
      await updateHotelSubscription({ id, data: data as HotelSubscriptionUpdateRequest });
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Hotel subscription updated successfully',
        life: 3000
      });
    } else {
      await createHotelSubscription(data as HotelSubscriptionCreateRequest);
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Hotel subscription created successfully',
        life: 3000
      });
    }
    
    subscriptionFormVisible.value = false;
    fetchHotelSubscriptions();
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Operation failed',
      life: 5000
    });
  }
};

const handleDeleteSubscription = async (id: string) => {
  try {
    await deleteHotelSubscription(id);
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Hotel subscription deleted successfully',
      life: 3000
    });
    fetchHotelSubscriptions();
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Delete failed',
      life: 5000
    });
  }
};

// Initial fetch
onMounted(() => {
  fetchSubscriptionPlans();
  fetchTransactions();
  fetchHotelSubscriptions();
});
</script>