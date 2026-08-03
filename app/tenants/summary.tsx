import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { getTenantSummaryTimeline } from '@/db/queries/audit-logs.queries';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import dayjs from 'dayjs';

type TimelineEvent = {
  id: string;
  date: string;
  title: string;
  desc: string;
  type: 'log' | 'finance';
};

export default function TenantSummaryScreen() {
  const { cnic, agreementId, name } = useLocalSearchParams<{ cnic: string; agreementId: string; name: string }>();
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTimeline = async () => {
      if (cnic && agreementId) {
        const result = await getTenantSummaryTimeline(cnic, agreementId);
        if (result.success) setTimeline(result.data as TimelineEvent[]);
      }
      setIsLoading(false);
    };
    fetchTimeline();
  }, [cnic, agreementId]);

  const handleDownloadPDF = async () => {
    try {
      // Helper function to translate technical titles into plain English
      const getFriendlyTitle = (title: string) => {
        if (title === 'STATUS_CHANGE') return 'Account Status Updated';
        if (title === 'DOCUMENT') return 'Document Attached';
        if (title === 'RENT GENERATED') return 'Monthly Rent Billed';
        if (title === 'MISC CHARGE') return 'Additional Charge';
        return title.replace('_', ' ');
      };

      // 1. Build a clean, non-technical HTML string
      const htmlContent = `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
            <style>
              body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 30px; color: #222; }
              .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #0f766e; padding-bottom: 20px; }
              .title { font-size: 26px; font-weight: bold; color: #0f766e; margin: 0 0 10px 0; }
              .subtitle { font-size: 16px; color: #555; margin: 0; }
              .event-row { display: flex; align-items: flex-start; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #eaeaea; }
              .date-col { width: 140px; font-size: 14px; font-weight: bold; color: #444; padding-top: 2px; }
              .content-col { flex: 1; }
              .event-title { font-weight: bold; font-size: 16px; margin: 0 0 6px 0; color: #111; }
              .event-desc { font-size: 14px; margin: 0; color: #555; line-height: 1.5; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 class="title">Tenant History Report</h1>
              <p class="subtitle"><strong>Tenant:</strong> ${name}</p>
              <p class="subtitle"><strong>CNIC:</strong> ${cnic}</p>
              <p class="subtitle" style="margin-top: 10px; font-size: 14px; color: #888;">Generated on ${dayjs().format('MMMM D, YYYY')}</p>
            </div>

            ${timeline.length === 0 ? '<p style="text-align:center; color: #888;">No history found for this tenant.</p>' : ''}

            ${timeline.map(event => `
              <div class="event-row">
                <!-- Simplified Date format (e.g., Aug 3, 2026) -->
                <div class="date-col">
                  ${dayjs(event.date).format('MMM D, YYYY')}
                </div>

                <div class="content-col">
                  <!-- Friendly Title -->
                  <h3 class="event-title">${getFriendlyTitle(event.title)}</h3>
                  <!-- The actual description -->
                  <p class="event-desc">${event.desc}</p>
                </div>
              </div>
            `).join('')}
          </body>
        </html>
      `;

      // 2. Generate the hidden PDF file
      const { uri } = await Print.printToFileAsync({ html: htmlContent });

      // 3. Share it
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
      } else {
        alert('Sharing is not available on this device');
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert('Could not generate the PDF document.');
    }
  };

  const getIconForEvent = (title: string, type: string) => {
    if (type === 'finance') return <Ionicons name="cash" size={20} color="#0f766e" />;
    if (title === 'STATUS_CHANGE') return <Ionicons name="power" size={20} color="#dc2626" />;
    if (title === 'DOCUMENT') return <Ionicons name="document-attach" size={20} color="#0284c7" />;
    return <Ionicons name="information-circle" size={20} color="#64748b" />;
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#0f766e" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />

      {/* HEADER */}
      <View className="flex-row justify-between items-center px-4 pt-12 pb-4 border-b border-border bg-white shadow-sm z-10">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="p-2 mr-1 -ml-2">
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <View>
            <Text className="text-xl font-bold text-foreground">Audit Summary</Text>
            <Text className="text-xs text-muted-foreground">{name}</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleDownloadPDF}
          className="bg-primary-50 px-3 py-2 rounded-lg flex-row items-center"
        >
          <Ionicons name="download" size={16} color="#0f766e" />
          <Text className="text-primary-700 font-bold ml-1 text-xs">Export PDF</Text>
        </TouchableOpacity>
      </View>

      {/* TIMELINE */}
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 bg-muted/10 p-4">

        <View className="mb-8">
          {timeline.length === 0 ? (
            <Text className="text-center text-muted-foreground mt-10">No history found for this tenant.</Text>
          ) : (
            timeline.map((event, index) => {
              const isLast = index === timeline.length - 1;

              return (
                <View key={event.id} className="flex-row mb-4">

                  {/* Left Column: Date & Time */}
                  <View className="w-20 items-end pt-1 pr-3">
                    <Text className="text-xs font-bold text-foreground">{dayjs(event.date).format('DD MMM')}</Text>
                    <Text className="text-[10px] text-muted-foreground mt-0.5">{dayjs(event.date).format('h:mm A')}</Text>
                  </View>

                  {/* Middle Column: The Line & Icon */}
                  <View className="items-center">
                    <View className="w-8 h-8 rounded-full bg-white border border-border items-center justify-center shadow-sm z-10">
                      {getIconForEvent(event.title, event.type)}
                    </View>
                    {/* The vertical connecting line */}
                    {!isLast && <View className="w-[2px] h-full bg-border -mt-2 -mb-6" />}
                  </View>

                  {/* Right Column: The Content Card */}
                  <View className="flex-1 pl-3 pb-2">
                    <View className="bg-white p-3 rounded-xl border border-border shadow-sm">
                      <Text className="text-xs font-bold text-muted-foreground mb-1">{event.title.replace('_', ' ')}</Text>
                      <Text className="text-sm text-foreground">{event.desc}</Text>
                    </View>
                  </View>

                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}