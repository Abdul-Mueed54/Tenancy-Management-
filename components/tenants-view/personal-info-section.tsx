import { View, Text, ActivityIndicator, } from 'react-native';
import dayjs from 'dayjs';

type Props = {
  tenant: {
    cnic_number: string;
    contact_no: string;
    cnic_expiry_date: string;
    permanent_address: string;
  };
};

export default function DisplayPersonalInfoOfTenant({tenant}: Props){
  return(
    <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-border">
      <Text className="text-xs font-bold text-muted-foreground mb-4 uppercase tracking-wider">Personal Information</Text>

      <View className="flex-row justify-between mb-3 border-b border-border/50 pb-3">
        <Text className="text-muted-foreground">CNIC Number</Text>
        <Text className="font-medium text-foreground">{tenant.cnic_number}</Text>
      </View>
      <View className="flex-row justify-between mb-3 border-b border-border/50 pb-3">
        <Text className="text-muted-foreground">Contact</Text>
        <Text className="font-medium text-foreground">{tenant.contact_no}</Text>
      </View>
      <View className="flex-row justify-between mb-3 border-b border-border/50 pb-3">
        <Text className="text-muted-foreground">CNIC Expiry</Text>
        <Text className="font-medium text-foreground">{dayjs(tenant.cnic_expiry_date).format('DD MMM YYYY')}</Text>
      </View>
      <View className="flex-col">
        <Text className="text-muted-foreground mb-1">Permanent Address</Text>
        <Text className="font-medium text-foreground leading-5">{tenant.permanent_address}</Text>
      </View>
    </View>
  );
}