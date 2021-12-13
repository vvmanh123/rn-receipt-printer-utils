//
//  RNBLEPrinter.m
//
//  Created by Till POS on 14/09/21.
//


#import <Foundation/Foundation.h>

#import "RNBLEPrinter.h"
#import "adapters/generic/BLEPrinterGenericAdapter.h"
#import "utils/NSDataAdditions.h"

@implementation RNBLEPrinter

- (dispatch_queue_t)methodQueue
{
    return dispatch_get_main_queue();
}

RCT_EXPORT_MODULE()

RCT_EXPORT_METHOD(connectAndSend:(NSString *)bdAddress
                  printRawData:(NSString *)text
                  brand:(NSString *)brand
                  success:(RCTResponseSenderBlock)successCallback
                  fail:(RCTResponseSenderBlock)errorCallback) {
    @try {
            BLEPrinterGenericAdapter *adapter = [BLEPrinterGenericAdapter alloc];
            [adapter connectAndSend:bdAddress printRawData:text success:successCallback fail:errorCallback];
    } @catch (NSException *exception) {
        errorCallback(@[exception.reason]);
    }
}

@end
